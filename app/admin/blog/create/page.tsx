// app/admin/blog/create/page.tsx

import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import BlogEditorPageClient from "./BlogEditorPageClient";

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

// This server component simply renders the client component
export default function BlogEditorPage() {
  return <BlogEditorPageClient />;
}
