// app/admin/blog/create/page.tsx

import { getMetadata } from "@/lib/seo-utils";
import { BlogEditor } from "../../dashboard/components/blog-editor";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

// === SEO METADATA (ADMIN - NOINDEX) ===
// It's crucial for admin/internal pages to be 'noindex, nofollow'.
// This metadata configuration ensures that search engines will not index this admin page
// and will not follow any links present on it.
export const metadata = getMetadata({
  title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
  description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
  path: "/admin/blog/create",
  robots: "noindex, nofollow", // This is the key directive for admin pages.
  openGraph: {
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    type: "website", // Standard Open Graph type, though its impact is minimal with 'noindex'.
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Cover image for ${SITE_NAME} Admin Panel`, // Specific alt text for the admin context.
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // Large image card for Twitter.
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // JSON-LD (schema.org structured data) is typically not needed for 'noindex' pages
  // as its purpose is to enhance public search visibility.
});

// This is the SINGLE default export for this Next.js App Router page.
// It renders the BlogEditor component within a basic layout.
export default function BlogEditorPage() { // Or rename this to CreateBlogPage if preferred
  // No need to generate or render schema for a 'noindex, nofollow' page.
  // The comments below confirm this decision is intentional and correct.

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*
          The BlogEditor component is rendered here.
          StructuredData (for JSON-LD schema) is intentionally omitted for admin pages,
          as 'noindex, nofollow' directives make schema unnecessary for SEO purposes.
        */}
        <BlogEditor />
      </div>
    </div>
  );
}
