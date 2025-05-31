// /lib/seo-utils.ts

type SEOInput = {
  title: string
  description: string
  path: string              // e.g. '/about', '/blog/some-slug'
  openGraph?: Partial<{
    images: string[]        // Array of image URLs
    type: string
  }>
  twitter?: Partial<{
    card: string
    site: string
    creator: string
    image: string
  }>
  schema?: object           // Raw JSON-LD object, if needed
  robots?: string           // e.g. "noindex, nofollow"
  customMeta?: Record<string, string> // For extra tags if needed
}

// === Base config ===
const BASE_URL = "https://flavorstudios.in"
const BASE_TWITTER = "@flavorstudios"
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.png`

export function getMetadata({
  title,
  description,
  path,
  openGraph,
  twitter,
  schema,
  robots,
  customMeta,
}: SEOInput) {
  const url = `${BASE_URL}${path}`

  // Open Graph images fallback
  const ogImages = openGraph?.images?.length
    ? openGraph.images.map(img =>
        img.startsWith("http") ? img : `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`
      )
    : [DEFAULT_OG_IMAGE]

  // Twitter image fallback
  const twitterImage = twitter?.image
    ? (twitter.image.startsWith("http") ? twitter.image : `${BASE_URL}${twitter.image.startsWith("/") ? "" : "/"}${twitter.image}`)
    : ogImages[0]

  // JSON-LD script, if needed
  const structuredData =
    schema
      ? [
          {
            tagName: "script",
            attributes: { type: "application/ld+json" },
            innerHTML: JSON.stringify(schema),
          },
        ]
      : []

  // Build metadata object for Next.js App Router
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots,
    openGraph: {
      title,
      description,
      url,
      type: openGraph?.type || "website",
      images: ogImages,
      siteName: "Flavor Studios",
    },
    twitter: {
      card: twitter?.card || "summary_large_image",
      site: twitter?.site || BASE_TWITTER,
      creator: twitter?.creator || BASE_TWITTER,
      title,
      description,
      images: [twitterImage],
    },
    ...(customMeta || {}),
    ...(structuredData.length && { other: structuredData }),
  }
}
