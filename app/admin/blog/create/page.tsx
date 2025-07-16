// app/admin/blog/create/page.tsx

import dynamic from "next/dynamic";
import { getMetadata } from "@/lib/seo-utils";
import { BlogEditor } from "../../dashboard/components/blog-editor";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

// === SEO METADATA (ADMIN - NOINDEX) ===
export const metadata = getMetadata({
  title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
  description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
  path: "/admin/blog/create",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Blog Editor – Admin Panel | ${SITE_NAME}`,
    description: `Use the admin panel to create and publish original anime news, blog stories, and updates for ${SITE_NAME}.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Cover image for ${SITE_NAME} Admin Panel`,
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
});

// Dynamically import AdminAuthGuard with SSR disabled
const AdminAuthGuard = dynamic(() => import("@/components/AdminAuthGuard"), { ssr: false });

export default function BlogEditorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BlogEditor is now wrapped in AdminAuthGuard for security */}
        <AdminAuthGuard>
          <BlogEditor />
        </AdminAuthGuard>
      </div>
    </div>
  );
}
