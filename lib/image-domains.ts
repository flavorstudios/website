import imageDomains from "@/config/image-domains.json";
import { SITE_URL } from "@/lib/constants";

const siteUrl = new URL(SITE_URL);
const siteOrigin = siteUrl.origin;
const siteHostname = siteUrl.hostname;

/** Domains that Next.js is configured to optimise. */
export const ALLOWED_IMAGE_DOMAINS = imageDomains as string[];

const PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export function isAllowedImageUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return false;
  }

  if (trimmedUrl.startsWith("/")) {
    return !trimmedUrl.startsWith("//");
  }

  if (trimmedUrl.startsWith("./") || trimmedUrl.startsWith("../")) {
    return true;
  }

  if (!PROTOCOL_REGEX.test(trimmedUrl) && !trimmedUrl.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmedUrl, siteUrl);

    if (parsed.hostname === siteHostname && parsed.origin === siteOrigin) {
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return true;
      }

      return false;
    }

    if (parsed.protocol !== "https:") {
      return false;
    }

    return ALLOWED_IMAGE_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}