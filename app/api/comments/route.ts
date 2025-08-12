import { NextRequest, NextResponse } from "next/server";
import { commentStore } from "@/lib/comment-store";
import type { Comment } from "@/lib/comment-store";

// --- Types ---
type RateInfo = { count: number; lastAttempt: number };
type PostType = "blog" | "video";
type CommentCreateInput = {
  postId: string;
  postType?: PostType;
  author: string;
  content: string;
};

// --- Global declaration to avoid `any` on globalThis ---
declare global {
  // eslint-disable-next-line no-var
  var __commentRateMap: Map<string, RateInfo> | undefined;
}

// --- In-memory per-IP rate limiter (safe for single server, dev, Vercel Hobby) ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_COMMENTS = 5;

const rateMap: Map<string, RateInfo> =
  globalThis.__commentRateMap ?? (globalThis.__commentRateMap = new Map());

function recordAttempt(ip: string) {
  const now = Date.now();
  const info = rateMap.get(ip);
  if (!info || now - info.lastAttempt > RATE_LIMIT_WINDOW) {
    rateMap.set(ip, { count: 1, lastAttempt: now });
  } else {
    info.count += 1;
    info.lastAttempt = now;
    rateMap.set(ip, info);
  }
}

function isRateLimited(ip: string): boolean {
  const info = rateMap.get(ip);
  if (!info) return false;
  if (Date.now() - info.lastAttempt > RATE_LIMIT_WINDOW) {
    rateMap.delete(ip);
    return false;
  }
  return info.count > MAX_COMMENTS;
}

function getRequestIp(request: NextRequest): string {
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  return "unknown";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const postType = (searchParams.get("postType") as PostType) || "blog";

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const comments = await commentStore.getByPost(postId, postType);
    const approved = comments.filter((c: Comment) => c.status === "approved");
    const result = approved.map((c: Comment) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt,
      status: c.status,
    }));

    const res = NextResponse.json(result);
    res.headers.set("Cache-Control", "public, max-age=60");
    return res;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const data = body as CommentCreateInput;

    const { postId, author, content } = data;
    const postType: PostType = data.postType || "blog";

    if (!postId || !author || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- Rate limiting before comment creation ---
    const ip = getRequestIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[Comments API] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    recordAttempt(ip);

    const comment = await commentStore.create({
      postId,
      postType,
      author,
      email: "",
      website: "",
      content,
      parentId: null,
      ip: request.headers.get("x-forwarded-for") ?? "",
      userAgent: request.headers.get("user-agent") ?? "",
    });

    // If the comment isn't pending (shouldn't happen unless moderation logic is changed), force it
    if (comment.status !== "pending") {
      await commentStore.updateStatus(postId, comment.id, "pending");
      comment.status = "pending";
    }

    const { id, createdAt, status } = comment;

    return NextResponse.json(
      { id, author, content, createdAt, status },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
