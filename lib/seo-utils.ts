const BASE_URL = "https://flavorstudios.in"
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`
const DEFAULT_TITLE_SUFFIX = "– Flavor Studios"
const DEFAULT_FB_APP_ID = "1404440770881914" // ← Your Facebook App ID

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
  robots, // e.g. "noindex, nofollow"
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
  // These get mapped into <meta property="..."> tags by Next.js
  const other: Array<{ property: string; content: string }> = []

  if (robots) {
    other.push({ property: "robots", content: robots })
  }

  if (schema) {
    // JSON-LD must use <script type="application/ld+json"> in _document/layout, 
    // so you may want to handle schema injection separately.
    // If you want to inject it via meta, it should use "name" not "property"—but that's not standard for JSON-LD!
    // Leave schema as-is for now; Next.js can handle this via 'metadata' API.
  }

  // Add Facebook App ID (the correct way is with "property" key, not "name")
  other.push({ property: "fb:app_id", content: DEFAULT_FB_APP_ID })

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
    // Next.js v13+ supports an 'other' array for custom meta properties
    other,
  }
}
