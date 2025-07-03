import { SITE_URL } from "@/lib/constants";

/**
 * Returns a canonical, SEO-optimized URL for any given path or absolute URL.
 * Handles slashes, root paths, and avoids double-prefix issues.
 */
export function getCanonicalUrl(path: string): string {
  try {
    // If already an absolute URL (with protocol), return as-is
    const url = new URL(path);
    return url.href;
  } catch {
    // path is relative or missing protocol, clean it up
    let cleanPath = path;

    // Remove any accidental leading SITE_URL from relative path
    if (cleanPath.startsWith(SITE_URL)) {
      cleanPath = cleanPath.slice(SITE_URL.length);
    }

    // Ensure leading slash
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    // Remove duplicate slashes (except the "://" after https)
    cleanPath = cleanPath.replace(/\/{2,}/g, '/');

    // Handle the root case
    if (cleanPath === '/' || cleanPath === '') {
      return SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    }

    // Remove trailing slash (unless it's just '/')
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }

    // Always join with a single slash
    const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    return `${baseUrl}${cleanPath}`;
  }
}
