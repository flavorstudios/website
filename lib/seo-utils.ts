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
  customMeta?: Record<string, string> // For extra meta tags
  customLinks?: { rel: string; href: string }[] // For custom links like Mastodon
}

// === Base config ===
const BASE_URL = "https://flavorstudios.in"
const BASE_TWITTER = "@flavorstudios"
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.png`

// === Change these for your real values ===
const GOOGLE_VERIFICATION_CODE = "2aFJnq37uAMARLFJJQy8aUjz2OV3sGGeR86taIdCpgE"
const MASTODON_URL = "https://mastodon.social/@flavorstudios"

export function getMetadata({
  title,
  description,
  path,
  openGraph,
  twitter,
  schema,
  robots,
  customMeta,
  customLinks,
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

  // --- "other" for meta and link tags ---
  const other: any[] = structuredData.slice()

  // Always add fb:app_id
  other.push({
    tagName: "meta",
    attributes: {
      property: "fb:app_id",
      content: "1404440770881914",
    },
  })

  // Always add Google site verification
  other.push({
    tagName: "meta",
    attributes: {
      name: "google-site-verification",
      content: GOOGLE_VERIFICATION_CODE,
    },
  })

  // Always add Mastodon verification link
  other.push({
    tagName: "link",
    attributes: {
      rel: "me",
      href: MASTODON_URL,
    },
  })

  // Add customMeta as meta tags (auto choose 'name' or 'property')
  if (customMeta) {
    for (const [key, value] of Object.entries(customMeta)) {
      let attrKey: "property" | "name" = "name"
      if (key.startsWith("og:") || key.startsWith("fb:")) attrKey = "property"
      other.push({
        tagName: "meta",
        attributes: {
          [attrKey]: key,
          content: value,
        },
      })
    }
  }

  // Add customLinks as <link rel="me" href="...">
  if (customLinks) {
    for (const { rel, href } of customLinks) {
      other.push({
        tagName: "link",
        attributes: { rel, href },
      })
    }
  }

  return {
    title,
    description,
    alternates: { canonical: url },
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
    ...(other.length && { other }),
  }
}
