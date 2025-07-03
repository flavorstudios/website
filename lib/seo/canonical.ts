import { SITE_URL } from "@/lib/constants";

/**
 * Returns a canonical, SEO-optimized URL for any given path or absolute URL.
 * Handles slashes, root paths, and avoids double-prefix issues.
 */
export function getCanonicalUrl(path: string): string {
  try {
    // If already an absolute URL, return as-is
    new URL(path);
    return path;
  } catch {
    // Normalize relative paths
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    normalizedPath = normalizedPath.replace(/\/+$/, ''); // Remove trailing slashes
    normalizedPath = normalizedPath.replace(/^\/+/, '/'); // Ensure only a single leading slash

    // Handle root path
    if (normalizedPath === '/') {
      return SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    }

    // Return full canonical URL
    const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    return `${baseUrl}${normalizedPath}`;
  }
}
