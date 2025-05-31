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

  // --- NEW: Collect customMeta into 'other' array ---
  const other: any[] = structuredData.slice() // Copy JSON-LD script if present

  // Always inject the fb:app_id tag (replace value if needed)
  other.push({
    tagName: "meta",
    attributes: {
      property: "fb:app_id",
      content: "1404440770881914",
    },
  })

  // If you want to add more customMeta tags, add them here
  if (customMeta) {
    for (const [key, value] of Object.entries(customMeta)) {
      other.push({
        tagName: "meta",
        attributes: {
          property: key,
          content: value,
        },
      })
    }
  }

  // --- MAIN RETURN ---
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
    ...(other.length && { other }), // <--- ENSURE 'other' IS ADDED!
  }
}
