import { getMetadata } from "@/lib/seo-utils"

const metadata = getMetadata({
  title: "Play Games – Flavor Studios",
  description:
    "Take a break and play classic games like Tic-Tac-Toe online! Challenge your friends or our advanced AI. Multiple modes, score tracking, and more—only on Flavor Studios.",
  path: "/play",
  openGraph: {
    images: ["https://flavorstudios.in/og-play.png"], // Update if you have a custom OG image for Play
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    image: "https://flavorstudios.in/og-play.png",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Play Games",
    "description":
      "Enjoy interactive games including Tic-Tac-Toe with AI and multiplayer options on Flavor Studios. Experience classic fun with a modern twist.",
    "url": "https://flavorstudios.in/play",
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "url": "https://flavorstudios.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://flavorstudios.in/favicon.png"
      }
    }
  }
})

export default metadata
