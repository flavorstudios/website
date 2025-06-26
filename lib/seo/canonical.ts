import { SITE_URL } from "@/lib/constants";

/**
 * Returns a canonical, SEO-optimized URL for any given path.
 * Ensures the URL is absolute and correctly formatted.
 */
export function getCanonicalUrl(path: string): string {
  // 1. Normalize the path to ensure it starts with a single slash
  //    and remove any trailing slashes to prevent issues with joins.
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  normalizedPath = normalizedPath.replace(/\/+$/, ''); // Remove trailing slashes
  normalizedPath = normalizedPath.replace(/^\/+/, '/'); // Ensure only a single leading slash

  // 2. Handle the root path specifically to avoid double slashes if SITE_URL already has a trailing slash.
  //    If the normalized path is just '/', we want to return only SITE_URL.
  if (normalizedPath === '/') {
    // Ensure SITE_URL itself does not have a trailing slash unless it's just "http://example.com/"
    const baseUrl = SITE_URL.endsWith('/') && SITE_URL.length > 'https://'.length + 1 ? SITE_URL.slice(0, -1) : SITE_URL;
    return baseUrl;
  }

  // 3. Construct the full URL.
  //    Remove a potential trailing slash from SITE_URL before concatenating
  //    to prevent double slashes if SITE_URL ends with one.
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  return `${baseUrl}${normalizedPath}`;
}
