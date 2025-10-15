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
    const baseHref = SITE_URL.endsWith('/') ? SITE_URL : `${SITE_URL}/`;
    const trimmed = typeof path === 'string' ? path.trim() : '';
    const relative = trimmed === '' ? '.' : trimmed;
    const url = new URL(relative, baseHref);

    // Normalise the pathname without touching query strings
    url.pathname = url.pathname.replace(/\/{2,}/g, '/');

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    const canonicalSite = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;

    if ((url.pathname === '' || url.pathname === '/') && !url.search && !url.hash) {
      return canonicalSite;
    }

    return `${url.origin}${url.pathname}${url.search}${url.hash}`;
  }
}
