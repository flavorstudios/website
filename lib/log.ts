/**
 * Consistent server-side error logging for Flavor Studios.
 *
 * Log format:
 *   [ISO timestamp] [context] {"key":"value"} error
 * - context: A label or file/function name (e.g., "google-session: final catch")
 * - error: The error object, string, or unknown (optional)
 * - meta: Additional JSON-serializable context (optional)
 * - Only logs in non-production; never leaks details to clients.
 */
import { serverEnv } from "@/env/server";

export function logError(
  context: string,
  error?: unknown,
  meta?: Record<string, unknown>,
) {
  if (serverEnv.NODE_ENV !== "production") {
    const time = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
    if (typeof error === "undefined") {
      // Only context provided
      console.error(`[${time}] [${context}]${metaString}`);
    } else if (error instanceof Error) {
      console.error(
        `[${time}] [${context}]${metaString}`,
        error.stack || error.message,
      );
    } else if (typeof error === "object" && error !== null) {
      console.error(
        `[${time}] [${context}]${metaString}`,
        JSON.stringify(error),
      );
    } else {
      console.error(`[${time}] [${context}]${metaString}`, error);
    }
  }
}
