/**
 * Consistent server-side error logging for Flavor Studios.
 *
 * Log format:
 *   [ISO timestamp] [context] {"key":"value"} error
 * - context: A label or file/function name (e.g., "google-session: final catch")
 * - error: The error object, string, or unknown (optional)
 * - meta: Additional JSON-serializable context (optional)
 * - Never leaks details to clients.
 */

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    const message =
      error instanceof Error && typeof error.message === "string"
        ? error.message
        : "Unknown serialization error";
    return `"[unserializable:${message}]"`;
  }
};

const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  if (typeof error === "object" && error !== null) {
    return safeStringify(error);
  }
  if (typeof error === "undefined") {
    return "";
  }
  return String(error);
};

export function logError(
  context: string,
  error?: unknown,
  meta?: Record<string, unknown>,
) {
  const time = new Date().toISOString();
  const payload: Record<string, unknown> = { timestamp: time, context };

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  if (typeof error === "undefined") {
    console.error(payload);
    return;
  }

  const errorPart = formatError(error);
  console.error({ ...payload, error: errorPart });
}

export function logBreadcrumb(
  context: string,
  meta?: Record<string, unknown>,
) {
  const time = new Date().toISOString();
  const payload: Record<string, unknown> = { timestamp: time, context };

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  console.info(payload);
}