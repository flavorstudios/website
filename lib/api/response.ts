import { NextResponse } from "next/server";

import { createCorsHeaders, type CorsOptions } from "@/lib/api/cors";
import { createRequestContext, type RequestContext } from "@/lib/api/request-context";

const mergeHeaders = (
  base: Headers,
  overrides?: HeadersInit,
): Headers => {
  const result = new Headers(base);
  if (!overrides) return result;
  const entries =
    overrides instanceof Headers
      ? overrides.entries()
      : Object.entries(overrides);
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      result.delete(key);
      for (const item of value) {
        result.append(key, item);
      }
      continue;
    }
    if (value === undefined || value === null) {
      result.delete(key);
      continue;
    }
    result.set(key, String(value));
  }
  return result;
};

type NextResponseOptions = NonNullable<
  Parameters<typeof NextResponse.json>[1]
>;

export type JsonResponseOptions = NextResponseOptions & {
  cacheControl?: string | null;
  cors?: CorsOptions;
};

const baseHeaders = (context: RequestContext, cors?: CorsOptions): Headers => {
  const headers = createCorsHeaders(context, cors);
  headers.set("X-Request-ID", context.requestId);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  return headers;
};

export const jsonResponse = <T>(
  context: RequestContext,
  body: T,
  options: JsonResponseOptions = {},
): NextResponse => {
  const { cacheControl, cors, ...responseInit } = options;
  const headers = baseHeaders(context, cors);
  if (cacheControl !== undefined && cacheControl !== null) {
    headers.set("Cache-Control", cacheControl);
  }
  const merged = mergeHeaders(headers, responseInit.headers);
  const init: NextResponseOptions = {
    ...responseInit,
    headers: merged,
  };
  return NextResponse.json(body, init);
};

export const textResponse = (
  context: RequestContext,
  body: string,
  options: JsonResponseOptions = {},
): NextResponse => {
  const { cacheControl, cors, ...responseInit } = options;
  const headers = baseHeaders(context, cors);
  if (cacheControl !== undefined && cacheControl !== null) {
    headers.set("Cache-Control", cacheControl);
  }
  const merged = mergeHeaders(headers, responseInit.headers);
  const init: NextResponseOptions = {
    ...responseInit,
    headers: merged,
  };
  return new NextResponse(body, init);
};

export const errorResponse = (
  context: RequestContext,
  body: unknown,
  status = 500,
  options: JsonResponseOptions = {},
): NextResponse => {
  return jsonResponse(context, body, { ...options, status });
};

export const withRequestContext = <T>(
  request: Request,
  handler: (context: RequestContext) => T,
): T => {
  const context = createRequestContext(request);
  return handler(context);
};

export const json = async <T>(request: Request): Promise<T> => {
  return (await request.json()) as T;
};
export { createRequestContext } from "@/lib/api/request-context";
export type { RequestContext } from "@/lib/api/request-context";