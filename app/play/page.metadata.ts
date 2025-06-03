import { getMetadata } from "@/lib/seo-utils"

export const metadata = getMetadata({
  title: "Play Games | Flavor Studios",
  description: "Challenge yourself with interactive games—play Tic-Tac-Toe, memory games, and more on Flavor Studios.",
  path: "/play",
  openGraph: {
    images: ["https://flavorstudios.in/og-image.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/og-image.png"
  },
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Play Games | Flavor Studios",
    "description": "Challenge yourself with interactive games—play Tic-Tac-Toe, memory games, and more on Flavor Studios.",
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "url": "https://flavorstudios.in"
    },
    "image": "https://flavorstudios.in/og-image.png",
    "url": "https://flavorstudios.in/play"
  },
  alternates: {
    canonical: "https://flavorstudios.in/play",
  },
});
