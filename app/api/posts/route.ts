import { NextRequest } from "next/server";
import { getPosts } from "@website/shared";
import { handleOptionsRequest } from "@/lib/api/cors";
import { createRequestContext, errorResponse, jsonResponse } from "@/lib/api/response";
import { logBreadcrumb } from "@/lib/log";

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const hasExternalBackend = Boolean(
  process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0,
);

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["GET"] });
}

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);

  if (hasExternalBackend) {
    logBreadcrumb("api/posts:get:deprecated", {
      requestId: context.requestId,
      hint: "Use NEXT_PUBLIC_API_BASE_URL",
    });
    return errorResponse(
      context,
      {
        error: "This route moved to the standalone backend.",
        next: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""}/posts`,
      },
      410,
    );
  }

  try {
    const { searchParams } = request.nextUrl;
    const author = searchParams.get("author");
    const startDate = parseDate(searchParams.get("startDate"));
    const endDateRaw = parseDate(searchParams.get("endDate"));
    const endDate = endDateRaw
      ? new Date(new Date(endDateRaw).setHours(23, 59, 59, 999))
      : null;

    const posts = await getPosts({
      author,
      startDate,
      endDate,
    });

    return jsonResponse(context, posts);
  } catch (error) {
    logBreadcrumb("api/posts:get:error", { requestId: context.requestId, error: String(error) });
    return errorResponse(context, { error: "Failed to fetch posts." }, 500);
  }
}