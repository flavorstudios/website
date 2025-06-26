// app/admin/blog/create/page.tsx

import { getMetadata } from "@/lib/seo-utils";
import { BlogEditor } from "../../dashboard/components/blog-editor";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

// === SEO METADATA (ADMIN - NOINDEX) ===
// It's crucial for admin/internal pages to be 'noindex, nofollow'
export const metadata = getMetadata({
  title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
  description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
  path: "/admin/blog/create",
  robots: "noindex, nofollow", // Prevents search engines from indexing and following links on this page
  openGraph: {
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    type: "website", // Standard type, though less relevant for noindexed pages
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Cover image for ${SITE_NAME} Admin Panel`, // Optional: More specific alt text
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // No JSON-LD/schema is needed or beneficial for noindexed admin pages.
});

export default function BlogEditorPage() {
  // No need to generate or render schema for a 'noindex, nofollow' page.
  // The commented-out schema generation and StructuredData component usage
  // below confirm this decision is intentional and correct.

  return (
    <>
      {/* For admin/editor pages, schema injection is usually unnecessary and removed for clarity. */}
      {/* If for some very specific internal analytics or tool, schema was needed despite noindex,
          you would uncomment the StructuredData component and its schema prop. */}
      {/* <StructuredData schema={schema} /> */}
      <BlogEditor />
    </>
  );
}

export default function CreateBlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogEditor />
      </div>
    </div>
  );
}
