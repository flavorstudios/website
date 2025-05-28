/**
 * Formats a date for use in sitemap XML
 * @param date - Date string, Date object, or null/undefined
 * @returns ISO date string suitable for sitemap
 */
export function formatSitemapDate(date: string | Date | null | undefined): string {
  try {
    if (!date) {
      return new Date().toISOString().split("T")[0]
    }

    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().split("T")[0]
    }

    return dateObj.toISOString().split("T")[0]
  } catch (error) {
    console.warn("Error formatting sitemap date:", error)
    return new Date().toISOString().split("T")[0]
  }
}

/**
 * Validates and formats a URL for sitemap
 * @param baseUrl - Base URL of the site
 * @param path - Path to append
 * @returns Complete URL
 */
export function formatSitemapUrl(baseUrl: string, path: string): string {
  // Ensure baseUrl doesn't end with slash and path starts with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, "")
  const cleanPath = path.startsWith("/") ? path : `/${path}`

  return `${cleanBaseUrl}${cleanPath}`
}

/**
 * Generates sitemap priority based on content type
 * @param type - Type of content (homepage, section, post, etc.)
 * @returns Priority value between 0.0 and 1.0
 */
export function getSitemapPriority(type: "homepage" | "section" | "post" | "page" | "legal"): number {
  switch (type) {
    case "homepage":
      return 1.0
    case "section":
      return 0.8
    case "post":
      return 0.7
    case "page":
      return 0.6
    case "legal":
      return 0.3
    default:
      return 0.5
  }
}

/**
 * Generates change frequency for sitemap based on content type
 * @param type - Type of content
 * @returns Change frequency string
 */
export function getSitemapChangeFreq(type: "homepage" | "section" | "post" | "page" | "legal"): string {
  switch (type) {
    case "homepage":
      return "daily"
    case "section":
      return "daily"
    case "post":
      return "weekly"
    case "page":
      return "monthly"
    case "legal":
      return "yearly"
    default:
      return "monthly"
  }
}
