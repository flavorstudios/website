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

  // Cheerio@1 parses HTML with parse5, which decodes entities by default. The
  // legacy `decodeEntities` option was removed from the public options surface,
  // so we rely on the default behavior and keep the API signature compatible
  // with newer Cheerio versions.
  const $ = load(`<div>${sanitized}</div>`);
  const text = $("div").text();

  return normalizeWhitespace(text);
}