/**
 * Utility functions for generating canonical URLs
 */

/**
 * Normalizes a URL path by removing query parameters and fixing trailing slashes
 * @param path - The path to normalize
 * @returns Clean, normalized path
 */
export function normalizeCanonicalPath(path: string): string {
  // Remove query parameters and hash fragments
  const cleanPath = path.split("?")[0].split("#")[0]

  // Remove trailing slash unless it's the root path
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1)
  }

  // Ensure root path has no trailing slash (Next.js convention)
  if (cleanPath === "" || cleanPath === "/") {
    return "/"
  }

  return cleanPath
}

/**
 * Generates a canonical URL for the given path
 * @param path - The path to generate canonical URL for
 * @param baseUrl - The base URL (defaults to production domain)
 * @returns Complete canonical URL
 */
export function generateCanonicalUrl(path: string, baseUrl = "https://flavorstudios.in"): string {
  const normalizedPath = normalizeCanonicalPath(path)

  // Handle root path
  if (normalizedPath === "/") {
    return baseUrl
  }

  return `${baseUrl}${normalizedPath}`
}

/**
 * Generates canonical metadata for Next.js pages
 * @param path - The current page path
 * @returns Metadata object with canonical URL
 */
export function generateCanonicalMetadata(path: string) {
  const canonicalPath = normalizeCanonicalPath(path)

  return {
    alternates: {
      canonical: canonicalPath,
    },
  }
}
