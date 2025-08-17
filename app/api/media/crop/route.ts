// app/api/media/crop/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Small helper to get a client IP safely
function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() || "unknown";
  const xreal = req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  const fwd = req.headers.get("forwarded");
  if (fwd) {
    const m = fwd.match(/for="?([^;"]+)"?/i);
    if (m?.[1]) return m[1];
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  // ---- Auth gate ----------------------------------------------------------
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, getClientIp(request), "media_crop_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- Input --------------------------------------------------------------
  type Rect = { width: number; height: number; x: number; y: number };
  type Body = { id?: string; rect?: Partial<Rect>; variantName?: string };

  let body: Body | null = null;
  try {
    body = (await request.json()) as unknown as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const r = body?.rect ?? {};
  const rect: Rect = {
    width: Number(r.width),
    height: Number(r.height),
    x: Number(r.x),
    y: Number(r.y),
  };

  // Validate required fields
  const validNumbers =
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    rect.width > 0 &&
    rect.height > 0 &&
    id.length > 0;

  if (!validNumbers) {
    return NextResponse.json(
      { error: "id and rect {width,height,x,y} are required" },
      { status: 400 }
    );
  }

  // Default variantName if none provided
  const variantName =
    typeof body?.variantName === "string" && body.variantName.trim()
      ? body.variantName.trim()
      : `crop-${rect.width}x${rect.height}-${rect.x}-${rect.y}`;

  // ---- Lazy import + crop -------------------------------------------------
  try {
    // Lazy-load to avoid touching Firebase at build time
    const { cropMedia } = await import("@/lib/media");
    const variant = await cropMedia(id, variantName, rect);
    return NextResponse.json({ success: !!variant, variant });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    // Surface a soft error if Cloud Storage isn’t configured in CI
    if (
      msg.includes("Cloud Storage bucket not configured") ||
      msg.includes("FIREBASE_ADMIN_NOT_CONFIGURED") ||
      msg.includes("ADMIN_DB_UNAVAILABLE")
    ) {
      return NextResponse.json(
        { error: "Admin/Storage not configured", detail: msg },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Crop failed", detail: msg }, { status: 500 });
  }
}
