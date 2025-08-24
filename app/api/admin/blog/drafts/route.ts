import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth";

export const runtime = "nodejs";

const DraftSchema = z.object({
  draftId: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.number().optional(),
});

export async function POST(req: Request) {
  if (!(await requireAdmin(req as any, "canManageBlogs"))) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const text = await req.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ ok: false, code: "BAD_JSON" }, { status: 422 });
    }
    const parsed = DraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, code: "VALIDATION" }, { status: 422 });
    }
    const { draftId, title, content, tags, version } = parsed.data;
    const user = await getSessionAndRole(req as any);
    if (!user) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
    }
    const prismaClient = await getPrisma();
    const saved = await prismaClient.$transaction(async (tx) => {
      const existing = await (tx as any).draft.findUnique({ where: { id: draftId } });
      if (existing && version && existing.version !== version) {
        return { conflict: true, server: existing };
      }
      const upserted = await (tx as any).draft.upsert({
        where: { id: draftId },
        update: {
          title,
          content,
          tags,
          userId: user.uid,
          version: existing ? existing.version + 1 : 1,
        },
        create: {
          id: draftId,
          userId: user.uid,
          title,
          content,
          tags,
          version: 1,
        },
      });
      return { conflict: false, upserted };
    });
    if (saved.conflict) {
      return NextResponse.json(
        { ok: false, code: "CONFLICT", server: saved.server },
        { status: 409 }
      );
    }
    return NextResponse.json({
      ok: true,
      draftId,
      version: (saved as any).upserted.version,
      savedAtISO: new Date().toISOString(),
    });
  } catch (e: any) {
    if (typeof e?.message === "string" && e.message.includes("too large")) {
      return NextResponse.json({ ok: false, code: "TOO_LARGE" }, { status: 413 });
    }
    return NextResponse.json({ ok: false, code: "SERVER_ERROR" }, { status: 503 });
  }
}