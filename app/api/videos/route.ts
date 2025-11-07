import { NextRequest } from "next/server";
import { videoStore } from "@/lib/content-store";
import { formatPublicVideo } from "@/lib/formatters";
import type { Video } from "@/lib/content-store";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { handleOptionsRequest } from "@/lib/api/cors";
import { logError } from "@/lib/log";

export function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request, { allowMethods: ["GET"] });
}

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);
  try {
    const videos = await videoStore.getAll();
    const published = videos.filter((video: Video) => video.status === "published");
    const result = published.map(formatPublicVideo);

    return jsonResponse(context, result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logError("videos:get", error, { requestId: context.requestId });
    return errorResponse(
      context,
      { error: "Failed to fetch published videos." },
      500,
    );
  }
}
