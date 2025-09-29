import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
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
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const postId = body?.postId?.trim();
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const token = createPreviewToken(postId, session.uid);
  return NextResponse.json({ token });
}