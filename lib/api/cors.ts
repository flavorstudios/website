import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { allowedOrigins } from "@/lib/base-url";
import { createRequestContext, type RequestContext } from "@/lib/api/request-context";

export type CorsOptions = {
  allowMethods?: string[];
  allowHeaders?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  maxAge?: number;
};

const mergeVary = (headers: Headers, value: string) => {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", value);
    return;
  }
  const parts = new Set(existing.split(/,\s*/));
  parts.add(value);
  headers.set("Vary", Array.from(parts).join(", "));
};

const pickAllowedOrigin = (origin: string | null): string | undefined => {
  const configured = allowedOrigins();
  if (origin && configured.has(origin)) {
    return origin;
  }
  if (configured.size === 1) {
    return configured.values().next().value;
  }
  return undefined;
};

export const createCorsHeaders = (
  context: RequestContext,
  options: CorsOptions = {},
): Headers => {
  const headers = new Headers();
  const allowOrigin = pickAllowedOrigin(context.origin);
  if (allowOrigin) {
    headers.set("Access-Control-Allow-Origin", allowOrigin);
  }

  headers.set(
    "Access-Control-Allow-Credentials",
    options.allowCredentials === false ? "false" : "true",
  );

  const allowMethods = options.allowMethods?.length
    ? options.allowMethods.join(", ")
    : "GET,POST,PUT,PATCH,DELETE,OPTIONS";
  headers.set("Access-Control-Allow-Methods", allowMethods);

  const requestHeaders = context.headers.get("access-control-request-headers");
  if (options.allowHeaders?.length) {
    headers.set("Access-Control-Allow-Headers", options.allowHeaders.join(", "));
  } else if (requestHeaders) {
    headers.set("Access-Control-Allow-Headers", requestHeaders);
  } else {
    headers.set(
      "Access-Control-Allow-Headers",
      "Authorization,Content-Type,Accept,X-Request-ID",
    );
  }

  const expose = new Set(options.exposeHeaders ?? []);
  expose.add("X-Request-ID");
  headers.set("Access-Control-Expose-Headers", Array.from(expose).join(", "));

  headers.set("Access-Control-Max-Age", String(options.maxAge ?? 600));

  mergeVary(headers, "Origin");
  mergeVary(headers, "Access-Control-Request-Headers");
  mergeVary(headers, "Access-Control-Request-Method");

  return headers;
};

export const handleOptionsRequest = (
  request: NextRequest,
  options: CorsOptions = {},
) => {
  const context = createRequestContext(request);
  const headers = createCorsHeaders(context, options);
  headers.set("Content-Length", "0");
  headers.set("X-Request-ID", context.requestId);
  headers.set("Cache-Control", "no-store, max-age=0");
  return new NextResponse(null, { status: 204, headers });
};