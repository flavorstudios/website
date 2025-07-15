// app/admin/layout.tsx

import type { ReactNode } from "react";
import "../globals.css"; // Ensure global styles are applied to the admin section
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { AdminAuthProvider } from "@/components/AdminAuthProvider"; // <-- Add this import

// Centralized metadata for the entire admin layout segment.
// This ensures all pages under /admin automatically inherit these SEO properties.
export const metadata = getMetadata({
  title: `Admin Console – ${SITE_NAME}`,
  description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
  path: "/admin", // Base path for this layout segment
  robots: "noindex, nofollow", // Crucial for admin pages: prevents indexing by search engines.
  openGraph: {
    title: `Admin Console – ${SITE_NAME}`,
    description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
    url: `${SITE_URL}/admin`, // Canonical URL for the admin base.
    type: "website", // Standard Open Graph type.
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`, // Default Open Graph image for admin pages.
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // Preferred Twitter card type.
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Admin Console – ${SITE_NAME}`,
    description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // JSON-LD (schema.org structured data) is intentionally omitted for admin pages,
  // as its purpose is for public search visibility, which is not desired here.
});

/**
 * Admin Layout Component.
 * This layout wraps all pages within the /admin route segment,
 * providing a common structure and applying shared metadata.
 */
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // DO NOT nest <html> or <body> tags here.
  // The root layout (app/layout.tsx) already provides them.
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
