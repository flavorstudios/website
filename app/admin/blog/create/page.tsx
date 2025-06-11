import { getMetadata } from "@/lib/seo-utils";
import { BlogEditor } from "../../dashboard/components/blog-editor";

// === SEO METADATA (ADMIN - NOINDEX) ===
export const metadata = getMetadata({
  title: "Create New Blog Post – Admin | Flavor Studios",
  description: "Use the admin panel to create and publish original anime news, blog stories, and updates for Flavor Studios.",
  path: "/admin/blog/create",
  openGraph: {
    title: "Create New Blog Post – Admin | Flavor Studios",
    description: "Use the admin panel to create and publish original anime news, blog stories, and updates for Flavor Studios.",
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
    title: "Create New Blog Post – Admin | Flavor Studios",
    description: "Use the admin panel to create and publish original anime news, blog stories, and updates for Flavor Studios.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  robots: "noindex, nofollow", // Prevent indexing of admin/editor pages
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Create New Blog Post – Admin",
    description: "Admin-only page for publishing original anime news, blog stories, and updates on Flavor Studios.",
    url: "https://flavorstudios.in/admin/blog/create",
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
    }
  }
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
