import { NextRequest } from "next/server";
import { commentStore } from "@/lib/comment-store";
import type { Comment } from "@/lib/comment-store";
import { handleOptionsRequest } from "@/lib/api/cors";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
  type RequestContext,
} from "@/lib/api/response";
import { logBreadcrumb, logError } from "@/lib/log";

type RateInfo = { count: number; lastAttempt: number };
type PostType = "blog" | "video";
type CommentCreateInput = {
  postId: string;
  postType?: PostType;
  author: string;
  content: string;
};

declare global {
  var __commentRateMap: Map<string, RateInfo> | undefined;
}

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_COMMENTS = 5;

const rateMap: Map<string, RateInfo> =
  globalThis.__commentRateMap ?? (globalThis.__commentRateMap = new Map());

const recordAttempt = (ip: string) => {
  const now = Date.now();
  const info = rateMap.get(ip);
  if (!info || now - info.lastAttempt > RATE_LIMIT_WINDOW) {
    rateMap.set(ip, { count: 1, lastAttempt: now });
  return;
  }

info.count += 1;
  info.lastAttempt = now;
  rateMap.set(ip, info);
};

const isRateLimited = (ip: string): boolean => {
  const info = rateMap.get(ip);
  if (!info) return false;
  if (Date.now() - info.lastAttempt > RATE_LIMIT_WINDOW) {
    rateMap.delete(ip);
    return false;
  }
  return info.count > MAX_COMMENTS;
};

const getRequestIp = (context: RequestContext): string => {
  const xfwd = context.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  return "unknown";
  };

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["GET", "POST"] });
}

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);

  try {
    const { searchParams } = request.nextUrl;
    const postId = searchParams.get("postId");
    const postType = (searchParams.get("postType") as PostType) || "blog";

    if (!postId) {
      return jsonResponse(
        context,
        { error: "postId is required" },
        { status: 400 },
      );
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

    return jsonResponse(context, result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logError("comments:get", error, { requestId: context.requestId });
    return errorResponse(
      context,
      { error: "Failed to fetch comments" },
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);

    try {
    const body: CommentCreateInput = (await request.json()) as CommentCreateInput;
    const { postId, author, content } = body;
    const postType: PostType = body.postType || "blog";

    if (!postId || !author || !content) {
      return jsonResponse(
        context,
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const ip = getRequestIp(context);
    if (isRateLimited(ip)) {
      logBreadcrumb("comments:rate-limited", {
        requestId: context.requestId,
        ip,
      });
      return jsonResponse(context, { error: "Too many requests" }, { status: 429 });
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
      ip,
      userAgent: context.headers.get("user-agent") ?? "",
    });

    if (comment.status !== "pending") {
      await commentStore.updateStatus(postId, comment.id, "pending");
      comment.status = "pending";
    }

    const { id, createdAt, status } = comment;

    return jsonResponse(
      context,
      { id, author, content, createdAt, status },
      { status: 201 },
    );
  } catch (error) {
    logError("comments:create", error, { requestId: context.requestId });
    return errorResponse(
      context,
      { error: "Failed to create comment" },
      500,
    );
  }
}
