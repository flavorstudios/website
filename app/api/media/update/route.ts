import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { updateMedia, getMediaById } from "@/lib/media";
import { canActOnMedia } from "@/lib/role-permissions";
import { logRouteAudit } from "@/lib/audit";
import { z } from "zod";

const UpdateSchema = z.object({
  id: z.string().min(1),
  alt: z.string().max(300).optional(),
  title: z.string().max(200).optional(),
  caption: z.string().max(2000).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().max(40)).max(50).optional(),
  focalPoint: z.tuple([z.number(), z.number()]).optional(),
  attachedTo: z.array(z.string()).max(100).optional(),
  customMeta: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

  let admin: { uid: string; role: string };
  try {
    admin = await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, ip, "media_update_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate body
  const parsed = UpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const { id, ...updates } = parsed.data;

  // Ensure target exists
  const existing = await getMediaById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Ownership/role check
  if (!canActOnMedia(admin.role, "edit", admin.uid, existing)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Perform update
  const media = await updateMedia(id, updates, admin.uid);

  // Audit
  await logRouteAudit({ uid: admin.uid, action: "edit", target: id, req: request });

  return NextResponse.json({ media });
}
