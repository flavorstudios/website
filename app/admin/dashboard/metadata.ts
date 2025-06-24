import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
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
  // Schema/JSON-LD intentionally removed (see head.tsx)
});

export default metadata;
