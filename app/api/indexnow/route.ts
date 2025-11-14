import { NextRequest } from "next/server";
import { serverEnv } from "@/env/server";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";
import { logError } from "@/lib/log";

// Use env variable, no hardcoded key
const INDEXNOW_KEY = serverEnv.INDEXNOW_KEY;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);
  const { url } = await request.json();

  if (!url) {
    return errorResponse(context, { error: "Missing URL in request body" }, 400);
  }
  if (!INDEXNOW_KEY) {
    logError("indexnow:config", undefined, { requestId: context.requestId });
    return errorResponse(
      context,
      { error: "IndexNow key missing in server environment" },
      500,
    );
  }

  try {
    const searchParams = new URLSearchParams({
      url,
      key: INDEXNOW_KEY,
    });

    const res = await fetch(`${INDEXNOW_ENDPOINT}?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "X-Request-ID": context.requestId,
      },
      cache: "no-store",
    });
    const text = await res.text();

    if (!res.ok) {
      logError("indexnow:upstream", undefined, {
        requestId: context.requestId,
        status: res.status,
      });
      return errorResponse(
        context,
        { error: "Failed to ping IndexNow", details: text },
        500,
      );
    }

    return jsonResponse(context, { success: true, details: text });
  } catch (err) {
    logError("indexnow:error", err, { requestId: context.requestId });
    return errorResponse(
      context,
      { error: "Unexpected error", message: String(err) },
      500,
    );
  }
}
