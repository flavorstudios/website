import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Flavor Studios – Anime & Stories That Stay With You",
  description:
    "Discover Flavor Studios: a visionary indie animation studio creating original anime, 3D animation, and inspiring stories. Watch, read, and join our global creative community. Animation with meaning—crafted in Blender.",
  path: "/",
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
    "@type": "Organization",
    "name": "Flavor Studios",
    "url": "https://flavorstudios.in/",
    "logo": "https://flavorstudios.in/og-image.png",
    "description":
      "Flavor Studios is a global, independent animation studio dedicated to meaningful anime, 3D storytelling, and original content—crafted in Blender and powered by passion.",
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
  robots: "index, follow",
  // Optional: For home, you can add customMeta if you want to set viewport, author, theme-color, etc.
  customMeta: {
    "theme-color": "#246bdb",
    "author": "Flavor Studios",
    "viewport": "width=device-width,initial-scale=1,maximum-scale=5",
  },
});
