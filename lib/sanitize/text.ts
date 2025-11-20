import "server-only";
import { load } from "cheerio";

import { sanitizeHtmlServer } from "@/lib/sanitize/server";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function htmlToPlainText(html: unknown): string {
  if (typeof html !== "string") {
    return "";
  }

  const sanitized = sanitizeHtmlServer(html);
  if (!sanitized) {
    return "";
  }

  const $ = load(`<div>${sanitized}</div>`, { decodeEntities: true });
  const text = $("div").text();

  return normalizeWhitespace(text);
}