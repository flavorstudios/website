import "server-only";

import { generateHTML, type JSONContent } from "@tiptap/core";

import { logBreadcrumb, logError } from "@/lib/log";
import { createSharedTiptapExtensions } from "@/lib/tiptap-extensions";

const TIPTAP_EXTENSIONS = createSharedTiptapExtensions();
const LOG_CONTEXT = "html-content";

function previewSnippet(value: string, maxLength = 200): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}…`;
}

function safeStringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    const json = JSON.stringify(value);
    if (typeof json === "string" && json.length > 0) {
      return json;
    }
  } catch (error) {
    logError(`${LOG_CONTEXT}:stringify-fallback`, error);
  }

  return String(value);
}

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
    if (isTiptapJson(parsed)) {
      return parsed as JSONContent;
    }

    logBreadcrumb(`${LOG_CONTEXT}:non-tiptap-json`, {
      preview: previewSnippet(value),
    });
    return null;
  } catch (error) {
    logError(`${LOG_CONTEXT}:parse-json`, error, {
      preview: previewSnippet(value),
    });
    return null;
  }
}

function convertTiptapJsonToHtml(doc: JSONContent): string | null {
  try {
    return generateHTML(doc, TIPTAP_EXTENSIONS);
  } catch (error) {
    logError(`${LOG_CONTEXT}:generate-html`, error, {
      type: doc.type,
    });
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

        logBreadcrumb(`${LOG_CONTEXT}:fallback`, {
          reason: "string-json-conversion-failed",
          preview: previewSnippet(trimmed),
        });
        return trimmed;
      }

      logBreadcrumb(`${LOG_CONTEXT}:fallback`, {
        reason: "string-json-not-tiptap",
        preview: previewSnippet(trimmed),
      });
      return trimmed;
    }

    return content;
  }

  if (isTiptapJson(content)) {
    const html = convertTiptapJsonToHtml(content);
    if (typeof html === "string") {
      return html;
    }

    logBreadcrumb(`${LOG_CONTEXT}:fallback`, {
      reason: "object-json-conversion-failed",
    });
    return safeStringify(content);
  }

  logBreadcrumb(`${LOG_CONTEXT}:fallback`, {
    reason: "unsupported-content",
  });
  return safeStringify(content);
}