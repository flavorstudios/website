// app/admin/login/page.tsx

import { getMetadata } from "@/lib/seo-utils"; // Only import what's directly used
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import AdminLoginForm from "./AdminLoginForm";

// --- SEO METADATA: Admin pages must be noindex, nofollow ---
export const metadata = getMetadata({
  title: `Admin Login – ${SITE_NAME}`,
  description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
  path: "/admin/login",
  robots: "noindex, nofollow", // Crucial for security and SEO hygiene on admin/internal pages
  openGraph: {
    title: `Admin Login – ${SITE_NAME}`,
    description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
    // 'url' is automatically set by getMetadata based on 'path'
    type: "website",
    siteName: SITE_NAME, // Use 'siteName' for consistency with Open Graph spec and Next.js types
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Admin login cover for ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Admin Login – ${SITE_NAME}`,
    description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // No JSON-LD/schema for admin pages; public schema is for indexable content.
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
