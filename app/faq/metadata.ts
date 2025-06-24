import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Flavor Studios FAQ – Anime & Support Help",
  description:
    "Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories.",
  path: "/faq",
  robots: "index,follow", // Explicit for public FAQ pages (SEO best practice)
  openGraph: {
    title: "Flavor Studios FAQ – Anime & Support Help",
    description:
      "Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories.",
    url: "https://flavorstudios.in/faq",
    type: "website",
    site_name: "Flavor Studios", // Always present!
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Flavor Studios FAQ – Anime & Support Help",
    description:
      "Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  // JSON-LD/schema REMOVED; now in head.tsx only
});
