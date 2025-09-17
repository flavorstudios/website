import "server-only";
import { load } from "cheerio";
import type { CheerioAPI, Element as CheerioElement } from "cheerio";

const BLOCKED_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "noscript",
  "template",
];

const URL_ATTRS = new Set(["href", "src", "xlink:href", "formaction"]);
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const COLON_PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const EVENT_HANDLER_REGEX = /^on/i;
const DANGEROUS_STYLE_REGEX = /expression|url\s*\(/i;

function isSafeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return true;
  }

  if (!COLON_PROTOCOL_REGEX.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeAttributes(element: CheerioElement, $: CheerioAPI) {
  const attribs = element.attribs ?? {};

  for (const name of Object.keys(attribs)) {
    const lower = name.toLowerCase();

    if (EVENT_HANDLER_REGEX.test(lower)) {
      $(element).removeAttr(name);
      continue;
    }

    if (lower === "style" && DANGEROUS_STYLE_REGEX.test(attribs[name] ?? "")) {
      $(element).removeAttr(name);
      continue;
    }

    if (URL_ATTRS.has(lower) && !isSafeUrl(attribs[name] ?? "")) {
      $(element).removeAttr(name);
    }
  }
}

export function sanitizeHtmlServer(html: string) {
  if (!html) {
    return "";
  }

  const $ = load(html, { decodeEntities: false });

  $(BLOCKED_TAGS.join(",")).remove();

  $("*").each((_, element) => {
    sanitizeAttributes(element, $);
  });

  const body = $("body");
  if (body.length) {
    return body.html() ?? "";
  }

  return $.root().html() ?? "";
}