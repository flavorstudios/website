import { getMetadata } from "@/lib/seo-utils";
import { BlogEditor } from "../../dashboard/components/blog-editor";

export const metadata = getMetadata({
  title: "Create New Post – Flavor Studios Admin",
  description: "Create and publish new blog posts for Flavor Studios.",
  path: "/admin/blog/create",
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
  robots: "noindex, nofollow", // Prevent indexing of admin/editor pages
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
