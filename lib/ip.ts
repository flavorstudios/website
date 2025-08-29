/**
 * Best-effort extraction of the client's IP address from a request.
 * Checks common proxy headers and falls back to "unknown" when not found.
 */
export function getClientIp(req: { headers: Headers }): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() || "unknown";
  const xreal = req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  const fwd = req.headers.get("forwarded");
  if (fwd) {
    const m = fwd.match(/for="?([^;\"]+)"?/i);
    if (m?.[1]) return m[1];
  }
  return "unknown";
}