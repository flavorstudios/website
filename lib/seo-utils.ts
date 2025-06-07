const BASE_URL = "https://flavorstudios.in"
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`
const DEFAULT_TITLE_SUFFIX = "– Flavor Studios"

export function getCanonicalUrl(path: string): string {
  return `${BASE_URL}${path}`
}

export function getMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  schema,
}: {
  title: string
  description: string
  path: string
  ogImage?: string
  schema?: object
}) {
  const fullTitle = `${title} ${DEFAULT_TITLE_SUFFIX}`
  const canonical = getCanonicalUrl(path)

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
    ...(schema && {
      other: {
        "application/ld+json": JSON.stringify(schema),
      },
    }),
  }
}
