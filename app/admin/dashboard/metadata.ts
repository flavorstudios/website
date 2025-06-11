import { getMetadata } from "@/lib/seo-utils";

const metadata = getMetadata({
  title: "Admin Dashboard – Flavor Studios",
  description:
    "Secure access to the Flavor Studios admin dashboard. Manage blog posts, videos, comments, categories, pages, and all system tools in one place.",
  path: "/admin/dashboard",
  openGraph: {
    title: "Admin Dashboard – Flavor Studios",
    description:
      "Secure access to the Flavor Studios admin dashboard. Manage blog posts, videos, comments, categories, pages, and all system tools in one place.",
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
    title: "Admin Dashboard – Flavor Studios",
    description:
      "Secure access to the Flavor Studios admin dashboard. Manage blog posts, videos, comments, categories, pages, and all system tools in one place.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Admin Dashboard – Flavor Studios",
    description:
      "Secure access to the Flavor Studios admin dashboard. Manage blog posts, videos, comments, categories, pages, and all system tools in one place.",
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
  robots: "noindex, nofollow",
});

export default metadata;
