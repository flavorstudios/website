import { getMetadata } from "@/lib/seo-utils";
import { BlogEditor } from "../../dashboard/components/blog-editor";

// === SEO METADATA (ADMIN - NOINDEX) ===
export const metadata = getMetadata({
  title: "Blog Editor – Admin Panel | Flavor Studios",
  description:
    "Use the admin panel to create and publish original anime news, blog stories, and updates for Flavor Studios.",
  path: "/admin/blog/create",
  openGraph: {
    title: "Blog Editor – Admin Panel | Flavor Studios",
    description:
      "Use the admin panel to create and publish original anime news, blog stories, and updates for Flavor Studios.",
    url: "https://flavorstudios.in/admin/blog/create",
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
    title: "Blog Editor – Admin Panel | Flavor Studios",
    description:
      "Use the admin panel to create and publish original anime news, blog stories, and updates for Flavor Studios.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  robots: "noindex, nofollow", // Admin pages should not be indexed
  // Schema/JSON-LD intentionally removed (now in head.tsx)
});

export default function CreateBlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogEditor />
      </div>
    </div>
  );
}
