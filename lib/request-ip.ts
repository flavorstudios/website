import { type NextRequest } from "next/server";

export function getClientIp(req: Request | NextRequest): string {
  // Check common proxy headers
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) {
    const ip = xfwd.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const xReal = req.headers.get("x-real-ip");
  if (xReal) {
    const ip = xReal.trim();
    if (ip) return ip;
  }

  const forwarded = req.headers.get("forwarded");
  if (forwarded) {
    const match = forwarded.match(/for="?([^;,"]+)"?/i);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "unknown";
}

export default getClientIp;