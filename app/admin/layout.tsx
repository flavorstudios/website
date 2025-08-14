// app/admin/layout.tsx

import type { ReactNode } from "react";
import "../globals.css"; // Ensure global styles are applied to the admin section
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip"; // <-- TooltipProvider import added
import DevTools from "./_dev-tools"; // mounts dev fetch logger in development

// Centralized metadata for the entire admin layout segment.
export const metadata = getMetadata({
  title: `Admin Console – ${SITE_NAME}`,
  description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
  path: "/admin",
  robots: "noindex, nofollow", // Crucial for admin pages: prevents indexing by search engines.
  openGraph: {
    title: `Admin Console – ${SITE_NAME}`,
    description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
    url: `${SITE_URL}/admin`,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Admin Console – ${SITE_NAME}`,
    description: `Secure admin console for managing all ${SITE_NAME} content and studio tools.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // JSON-LD intentionally omitted for admin pages
});

/**
 * Admin Layout Component.
 * This layout wraps all pages within the /admin route segment,
 * providing a common structure and applying shared metadata.
 * TooltipProvider is applied globally so any admin page can use tooltips.
 */
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // DO NOT nest <html> or <body> tags here.
  // The root layout (app/layout.tsx) already provides them.
  return (
    <>
      <DevTools />
      <AdminAuthProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </AdminAuthProvider>
    </>
  );
}
