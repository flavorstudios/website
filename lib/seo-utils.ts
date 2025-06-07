const BASE_URL = "https://flavorstudios.in"
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`
const DEFAULT_TITLE_SUFFIX = "– Flavor Studios"
const DEFAULT_FB_APP_ID = "1404440770881914" // ← Add your Facebook App ID here

export function getCanonicalUrl(path: string): string {
  return `${BASE_URL}${path}`
}

/**
 * SEO Metadata helper for Flavor Studios.
 * Supports title, description, canonical, Open Graph, Twitter, Schema, robots, and fb:app_id meta.
 */
export function getMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  robots, // New: robots option for meta (e.g. "noindex, nofollow")
}: {
  title: string
  description: string
  path: string
  ogImage?: string
  schema?: object
  robots?: string
}) {
  const fullTitle = `${title} ${DEFAULT_TITLE_SUFFIX}`
  const canonical = getCanonicalUrl(path)

  // Prepare additional meta fields (robots, schema, fb:app_id)
  const other: Record<string, string> = {}

  if (robots) {
    other.robots = robots
  }

  if (schema) {
    other["application/ld+json"] = JSON.stringify(schema)
  }

  // Add Facebook App ID globally for Open Graph
  other["fb:app_id"] = DEFAULT_FB_APP_ID

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@flavorstudios",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(Object.keys(other).length > 0 && { other }),
  }
}
