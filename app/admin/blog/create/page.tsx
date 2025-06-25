import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { BlogEditor } from "../../dashboard/components/blog-editor";

// === SEO METADATA (ADMIN - NOINDEX) ===
export const metadata = getMetadata({
  title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
  description:
    `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
  path: "/admin/blog/create",
  openGraph: {
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description:
      `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/blog/create`, // Automatically generated
    type: "website",
    site_name: SITE_NAME, // Enforced via helper
    images: [
      {
        url: `${SITE_URL}/cover.jpg`, // Dynamically generated
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description:
      `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
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
