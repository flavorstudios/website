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

type DomPurifyModule = typeof import("isomorphic-dompurify");
let domPurifyInstance: DomPurifyModule["default"] | null = null;
let domPurifyLoading: Promise<void> | null = null;

function ensureDomPurify() {
  if (typeof window === "undefined" || domPurifyInstance || domPurifyLoading) {
    return;
  }

  domPurifyLoading = import("isomorphic-dompurify")
    .then((module) => {
      domPurifyInstance = module.default ?? (module as DomPurifyModule["default"]);
    })
    .catch(() => {
      domPurifyInstance = null;
    })
    .finally(() => {
      domPurifyLoading = null;
    });
}

function isSafeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return true;
  }

  if (!COLON_PROTOCOL_REGEX.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

function fallbackSanitize(html: string) {
  if (typeof window === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll(BLOCKED_TAGS.join(",")).forEach((element) => {
    element.remove();
  });

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();

      if (EVENT_HANDLER_REGEX.test(name)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (name === "style" && DANGEROUS_STYLE_REGEX.test(attribute.value)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (URL_ATTRS.has(name) && !isSafeUrl(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body?.innerHTML ?? "";
}

export function sanitizeHtmlClient(
  html: string,
  options?: Parameters<DomPurifyModule["default"]["sanitize"]>[1],
) {
  if (!html) {
    return "";
  }

  ensureDomPurify();

  if (domPurifyInstance) {
    return domPurifyInstance.sanitize(html, options);
  }

  return fallbackSanitize(html);
}