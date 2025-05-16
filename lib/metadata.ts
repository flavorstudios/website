import type { Metadata } from "next"

// Base metadata that will be used as fallback for all pages
export const siteConfig = {
  name: "Flavor Studios",
  description: "Original anime-inspired content and creative studio",
  url: "https://flavorstudios.in",
  ogImage: "https://flavorstudios.in/og-image.jpg",
}

// Helper function to construct metadata with defaults
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: { rel: string; url: string; type?: string }[]
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
      type: "website",
      siteName: siteConfig.name,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
