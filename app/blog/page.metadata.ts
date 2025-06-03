import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Blog: Anime Insights & Studio Stories | Flavor Studios",
  description:
    "Read behind-the-scenes anime stories, production tips, and creative insights from Flavor Studios. Explore categories, featured posts, and the latest updates.",
  path: "/blog",
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
    "name": "Blog: Anime Insights & Studio Stories",
    "description":
      "Read behind-the-scenes anime stories, production tips, and creative insights from Flavor Studios. Explore categories, featured posts, and the latest updates.",
    "url": "https://flavorstudios.in/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "url": "https://flavorstudios.in",
    },
    "datePublished": "2025-05-09",
    "dateModified": "2025-05-09",
  },
  robots: "index, follow",
});
