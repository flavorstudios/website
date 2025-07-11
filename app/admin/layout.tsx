// app/admin/layout.tsx

import type { ReactNode } from "react";
import "../globals.css"; // Ensure global styles are applied to the admin section
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

// Centralized metadata for the entire admin layout segment.
// This ensures all pages under /admin automatically inherit these SEO properties.
export const metadata = getMetadata({
  title: `Admin Console – ${SITE_NAME}`,
  description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
  path: "/admin", // Base path for this layout segment
  robots: "noindex, nofollow", // Crucial for admin pages: prevents indexing by search engines.
                               // Also prevents crawlers from following links on these pages.
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
    site: SITE_BRAND_TWITTER, // Consistent use of the SITE_BRAND_TWITTER constant.
    creator: SITE_BRAND_TWITTER, // Consistent use of the SITE_BRAND_TWITTER constant.
    title: `Admin Console – ${SITE_NAME}`,
    description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
    images: [`${SITE_URL}/cover.jpg`], // Default Twitter card image for admin pages.
  },
  // JSON-LD (schema.org structured data) is intentionally omitted for admin pages,
  // as its purpose is for public search visibility, which is not desired here.
});

/**
 * Admin Layout Component.
 * This layout wraps all pages within the /admin route segment,
 * providing a common structure and applying shared metadata.
 *
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components/pages to be rendered within this layout.
 * @returns {JSX.Element} The HTML structure for the admin section.
 */
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      {/* The body applies global anti-aliasing styles. */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
