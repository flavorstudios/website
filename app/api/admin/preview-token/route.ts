import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { logError } from "@/lib/log";
import { createPreviewToken } from "@/lib/preview-token";
import { serverEnv } from "@/env/server";

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

export async function GET(request: NextRequest) {
  const nodeEnv = process.env.NODE_ENV || serverEnv.NODE_ENV;

  if (nodeEnv === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const expired = url.searchParams.get("expired") === "1";
  const postId = url.searchParams.get("postId")?.trim() || "1";
  const uid = url.searchParams.get("uid")?.trim() || "preview";
  const ttl = expired ? -60 : 300;

  const token = createPreviewToken(postId, uid, ttl);

  return NextResponse.json({ token, postId, uid, expired });
}
