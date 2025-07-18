// lib/log.ts

/**
 * Consistent server-side error logging for Flavor Studios.
 * - Context: A label or file/function name (e.g., "google-session: final catch")
 * - error: The error object, string, or unknown
 * - Only logs in non-production; never leaks details to clients.
 */
export function logError(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    const time = new Date().toISOString();
    if (error instanceof Error) {
      console.error(`[${time}] [${context}]`, error.stack || error.message);
    } else if (typeof error === "object" && error !== null) {
      console.error(`[${time}] [${context}]`, JSON.stringify(error));
    } else {
      console.error(`[${time}] [${context}]`, error);
    }
  }
}
