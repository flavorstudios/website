import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Watch Anime & Animation | Flavor Studios",
  description: "Stream original anime-inspired stories, tutorials, and animation projects. Discover all videos and series by Flavor Studios—organized by category for your binge-watching pleasure.",
  path: "/watch",
  openGraph: {
    images: ["https://flavorstudios.in/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/og-image.png",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Watch Anime & Animation",
    "description": "Browse all original anime, videos, and animation content by Flavor Studios.",
    "url": "https://flavorstudios.in/watch",
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "url": "https://flavorstudios.in"
    },
    "datePublished": "2025-05-09",
    "dateModified": "2025-05-09"
  },
  robots: "index, follow"
})
