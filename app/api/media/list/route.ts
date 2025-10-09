import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { listMedia } from "@/lib/media";
import { hasE2EBypass } from "@/lib/e2e-utils";

// Ensure this API route is always executed at runtime
export const dynamic = "force-dynamic";

function toInt(val: string | null, fallback: number) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  const bypass = hasE2EBypass(request);

  if (!bypass) {
    try {
      await verifyAdminSession(sessionCookie);
    } catch {
      // Log the denial but do not leak details to the client
      await logAdminAuditFailure(null, getClientIp(request), "media_list_denied");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse and sanitize query params
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Math.min(100, toInt(searchParams.get("limit"), 50)));
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const startAfter = searchParams.get("cursor")
    ? toInt(searchParams.get("cursor"), NaN)
    : undefined;

  try {
    if (bypass) {
      const cursorValue = Number.isFinite(startAfter!) ? startAfter : undefined;
      if (cursorValue) {
        return NextResponse.json(
          {
            media: [
              {
                id: "media-e2e-2",
                url: "/cover.jpg",
                filename: "studio-team.jpg",
                name: "Studio Team Portrait",
                alt: "Team gathered in the studio",
                mime: "image/jpeg",
                size: 340_112,
                attachedTo: ["blog-204"],
                createdAt: "2024-02-12T15:24:00.000Z",
                updatedAt: "2024-02-12T15:24:00.000Z",
              },
            ],
            cursor: null,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          media: [
            {
              id: "media-e2e-1",
              url: "/cover.jpg",
              filename: "launch-trailer.png",
              name: "Launch Trailer Thumbnail",
              alt: "Launch trailer hero art",
              mime: "image/png",
              size: 284_512,
              attachedTo: ["blog-203", "video-58"],
              createdAt: "2024-01-05T10:00:00.000Z",
              updatedAt: "2024-03-02T18:30:00.000Z",
            },
          ],
          cursor: 2,
        },
        { status: 200 }
      );
    }
    
    const result = await listMedia({
      limit,
      search,
      type,
      order,
      startAfter: Number.isFinite(startAfter!) ? startAfter : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch {
    // Defensive: never leak internal errors
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 },
    );
  }
}
