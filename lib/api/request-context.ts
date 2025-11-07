import crypto from "node:crypto";
import type { NextRequest } from "next/server";

import { normalizeOrigin, resolveRequestBaseUrl } from "@/lib/base-url";

export type RequestContext = {
  request: NextRequest | Request;
  headers: Headers;
  method: string;
  origin: string | null;
  baseUrl: string;
  requestId: string;
};

const getHeaders = (request: NextRequest | Request): Headers => {
  if ("headers" in request) {
    return request.headers;
  }
  return new Headers();
};

const getMethod = (request: NextRequest | Request): string => {
  if ("method" in request && request.method) {
    return request.method;
  }
  return "GET";
};

export const createRequestContext = (
  request: NextRequest | Request,
): RequestContext => {
  const headers = getHeaders(request);
  const suppliedId =
    headers.get("x-request-id") ?? headers.get("x-correlation-id") ?? "";
  const requestId = suppliedId.trim() || crypto.randomUUID();

  const origin = normalizeOrigin(headers.get("origin"));

  return {
    request,
    headers,
    method: getMethod(request),
    origin,
    baseUrl: resolveRequestBaseUrl(request),
    requestId,
  };
};