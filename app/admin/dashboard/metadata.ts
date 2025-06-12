import { getMetadata } from "@/lib/seo-utils";

const metadata = getMetadata({
  title: "Flavor Studios Admin Dashboard",
  description:
    "Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard.",
  path: "/admin/dashboard",
  robots: "noindex, nofollow", // Admin area must not be indexed
  openGraph: {
    title: "Flavor Studios Admin Dashboard",
    description:
      "Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard.",
    url: "https://flavorstudios.in/admin/dashboard",
    type: "website",
    site_name: "Flavor Studios",
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
    title: "Flavor Studios Admin Dashboard",
    description:
      "Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Flavor Studios Admin Dashboard",
    description:
      "Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard.",
    url: "https://flavorstudios.in/admin/dashboard",
    applicationCategory: "AdministrativeApplication",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
      sameAs: [
        "https://www.youtube.com/@flavorstudios",
        "https://www.instagram.com/flavorstudios",
        "https://twitter.com/flavor_studios",
        "https://www.facebook.com/flavourstudios",
        "https://www.threads.net/@flavorstudios",
        "https://discord.com/channels/@flavorstudios",
        "https://t.me/flavorstudios",
        "https://www.reddit.com/r/flavorstudios/",
        "https://bsky.app/profile/flavorstudios.bsky.social"
      ]
    },
  },
});

export default metadata;
