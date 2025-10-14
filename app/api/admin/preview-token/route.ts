import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { logError } from "@/lib/log";
import { createPreviewToken } from "@/lib/preview-token";
import { serverEnv } from "@/env/server";

const isE2EEnvironment =
  process.env.NEXT_PUBLIC_E2E === "true" ||
  process.env.NEXT_PUBLIC_E2E === "1" ||
  process.env.E2E === "true";

function buildE2ETokenResponse(
  postId: string,
  uid: string,
  expired: boolean,
) {
  const state = expired ? "expired" : "valid";
  const now = Date.now();
  const expiresAt = expired ? now - 60_000 : now + 60_000;
  const token = `e2e-token:${state}:${postId}:${uid || "bypass"}`;
  return NextResponse.json({ token, expiresAt }, { status: 200 });
}

interface PreviewTokenRequestBody {
  postId?: string;
}

function resolveRequestUrl(request: NextRequest): URL {
  const maybeNextUrl = (request.nextUrl as URL | undefined) ?? null;
  if (maybeNextUrl) {
    return maybeNextUrl;
  }

  const originHeader =
    typeof request.headers?.get === "function"
      ? request.headers.get("origin")
      : undefined;
  const origin = originHeader ?? "http://localhost";
  const rawUrl = request.url ?? "/";
  return new URL(rawUrl, origin);
}

export async function POST(request: NextRequest) {
  const nextUrl = resolveRequestUrl(request);
  const uidOverride = nextUrl.searchParams.get("uid")?.trim();
  const expired = nextUrl.searchParams.get("expired") === "1";
  const bypassAuth = isE2EEnvironment && uidOverride === "bypass";

  if (!bypassAuth && !(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = bypassAuth ? { uid: uidOverride ?? "bypass" } : await getSessionInfo(request);
  const sessionUid = session?.uid;

  if (!sessionUid) {
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

  if (isE2EEnvironment) {
    return buildE2ETokenResponse(postId, sessionUid ?? (uidOverride || "bypass"), expired);
  }

  try {
    const ttl = expired ? -60 : 300;
    const token = createPreviewToken(postId, sessionUid, ttl);
    const expiresAt = Date.now() + ttl * 1000;
    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    logError("preview-token: failed to create preview token", error, {
      postId,
      uid: sessionUid,
    });
    return NextResponse.json(
      { error: "Preview secret not configured" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const nextUrl = resolveRequestUrl(request);
  const expired = nextUrl.searchParams.get("expired") === "1";
  const postId = nextUrl.searchParams.get("postId")?.trim() || "1";
  const rawUid = nextUrl.searchParams.get("uid")?.trim();
  const uid = rawUid && rawUid.length > 0 ? rawUid : "preview";
  const bypassAuth = isE2EEnvironment && uid === "bypass";
  const nodeEnv = process.env.NODE_ENV || serverEnv.NODE_ENV;

  if (isE2EEnvironment) {
    return buildE2ETokenResponse(postId, uid, expired);
  }

  if (!bypassAuth && nodeEnv === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ttl = expired ? -60 : 300;

  try {
    const token = createPreviewToken(postId, uid, ttl);
    const expiresAt = Date.now() + ttl * 1000;
    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    logError("preview-token: failed to create preview token (GET)", error, {
      postId,
      uid,
      expired,
    });

    if (bypassAuth) {
      return buildE2ETokenResponse(postId, uid, expired);
    }

    return NextResponse.json(
      { error: "Preview secret not configured" },
      { status: 500 },
    );
  }
}