import { getMetadata } from "@/lib/seo-utils"

export const metadata = getMetadata({
  title: "About Flavor Studios | Indie Animation & Storytelling Studio",
  description:
    "Learn about Flavor Studios—an independent animation studio creating emotionally resonant anime and original 3D stories. Discover our journey, values, mission, and creative legacy.",
  path: "/about",
  openGraph: {
    images: ["https://flavorstudios.in/og-image.png"],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/og-image.png",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Flavor Studios",
    "url": "https://flavorstudios.in/about",
    "logo": "https://flavorstudios.in/og-image.png",
    "description": "Independent global animation studio crafting original anime, 3D animation, and emotionally resonant stories with a community-driven approach.",
    "foundingDate": "2021",
    "sameAs": [
      "https://www.youtube.com/@flavorstudios",
      "https://www.facebook.com/flavourstudios",
      "https://www.instagram.com/flavorstudios",
      "https://twitter.com/flavor_studios",
      "https://www.threads.com/@flavorstudios",
      "https://bsky.app/profile/flavorstudios.bsky.social",
      "https://mastodon.social/@flavorstudios",
      "https://discord.com/channels/@flavorstudios",
      "https://t.me/flavorstudios",
      "https://www.reddit.com/r/flavorstudios/"
    ]
  },
  robots: "index, follow"
});
