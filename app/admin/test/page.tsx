// app/admin/test/page.tsx

import { cookies } from "next/headers";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import Link from "next/link"; // Use Next.js Link for SPA routing

// NOTE: This page is intentionally noindex, nofollow. Do not add schema or expose internal details.

// === SEO METADATA (noindex for internal pages, but still structured) ===
// This metadata configuration ensures the page is not indexed by search engines
// and their crawlers do not follow links from it, crucial for admin/internal pages.
export const metadata = getMetadata({
  title: `Admin Test – ${SITE_NAME}`,
  description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
  path: "/admin/test",
  robots: "noindex, nofollow", // Key directive for security and SEO hygiene.
  openGraph: {
    title: `Admin Test – ${SITE_NAME}`,
    description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
    // 'url' is automatically set by getMetadata based on 'path' property
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Admin test page cover for ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Admin Test – ${SITE_NAME}`,
    description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // Canonical/alternates set automatically by getMetadata
  // No JSON-LD/schema: admin pages are intentionally private
});

export default async function AdminTest() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin-session");

  return (
    <div className="p-8">
      {/* 
        This is an internal admin test page, not visible to search engines.
        No StructuredData/JSON-LD, no public schema. 
      */}
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>
          <strong>Session Cookie:</strong> {session?.value || "Not found"}
        </p>
        <p>
          <strong>Is Authenticated:</strong>{" "}
          {session?.value === "authenticated" ? "Yes" : "No"}
        </p>
      </div>
      {session?.value === "authenticated" && (
        <div className="mt-4">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
