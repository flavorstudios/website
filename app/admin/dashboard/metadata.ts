import { getMetadata } from "@/lib/seo-utils";

const metadata = getMetadata({
  title: "Admin Dashboard – Flavor Studios",
  description:
    "Manage all blog posts, videos, comments, categories, pages, and system tools for Flavor Studios in one place.",
  path: "/admin/dashboard",
  openGraph: {
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  robots: "noindex, nofollow",
});

export default metadata;
