import "server-only";

import { generateHTML, type JSONContent } from "@tiptap/core";

import { createSharedTiptapExtensions } from "@/lib/tiptap-extensions";

const TIPTAP_EXTENSIONS = createSharedTiptapExtensions();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTiptapJson(value: unknown): value is JSONContent {
  if (!isPlainObject(value)) {
    return false;
  }

  if (typeof value.type === "string" && value.type.length > 0) {
    return true;
  }

  if (Array.isArray(value.content)) {
    return value.content.some((item) => isTiptapJson(item));
  }

  return false;
}

function fromStringifiedJson(value: string): JSONContent | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isTiptapJson(parsed) ? (parsed as JSONContent) : null;
  } catch {
    return null;
  }
}

function convertTiptapJsonToHtml(doc: JSONContent): string | null {
  try {
    return generateHTML(doc, TIPTAP_EXTENSIONS);
  } catch {
    return null;
  }
}

function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

export function ensureHtmlContent(content: unknown): string {
  if (content == null) {
    return "";
  }

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) {
      return "";
    }

    if (looksLikeJson(trimmed)) {
      const parsed = fromStringifiedJson(trimmed);
      if (parsed) {
        const html = convertTiptapJsonToHtml(parsed);
        if (typeof html === "string") {
          return html;
        }

        return "";
      }

      return "";
    }

    return content;
  }

  if (isTiptapJson(content)) {
    const html = convertTiptapJsonToHtml(content);
    if (typeof html === "string") {
      return html;
    }
  }

  return "";
}