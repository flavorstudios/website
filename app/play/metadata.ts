import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Play Games – Flavor Studios",
  description:
    "Take a break and play classic games like Tic-Tac-Toe online! Challenge your friends or our advanced AI. Multiple modes, score tracking, and more—only on Flavor Studios.",
  path: "/play",
  openGraph: {
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ], // Updated: array of objects, not strings
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    images: ["https://flavorstudios.in/cover.jpg"], // Updated: array of strings
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Play Games",
    description:
      "Enjoy interactive games including Tic-Tac-Toe with AI and multiplayer options on Flavor Studios. Experience classic fun with a modern twist.",
    url: "https://flavorstudios.in/play",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
    },
  },
}); // <- semicolon is important
