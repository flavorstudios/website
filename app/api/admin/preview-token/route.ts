import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { logError } from "@/lib/log";
import { createPreviewToken } from "@/lib/preview-token";

interface PreviewTokenRequestBody {
  postId?: string;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getSessionInfo(request);
  if (!session?.uid) {
    return NextResponse.json({ error: "Missing session" }, { status: 401 });
  }

  let body: PreviewTokenRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const postId = body?.postId?.trim();
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  try {
    const token = createPreviewToken(postId, session.uid);
    return NextResponse.json({ token });
  } catch (error) {
    logError("preview-token: failed to create preview token", error, {
      postId,
      uid: session.uid,
    });
    return NextResponse.json(
      { error: "Preview secret not configured" },
      { status: 500 },
    );
  }
}