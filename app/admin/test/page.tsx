// app/admin/test/page.tsx

import { cookies } from "next/headers";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import Link from "next/link";
// Change: import requireAdminAction instead of requireAdmin
import { requireAdminAction } from "@/lib/admin-auth";

// === SEO METADATA (noindex for internal pages, but still structured) ===
export const metadata = getMetadata({
  title: `Admin Test – ${SITE_NAME}`,
  description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
  path: "/admin/test",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Admin Test – ${SITE_NAME}`,
    description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
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
});

export default async function AdminTest() {
  // Secure: Only show page if session is authenticated via Firebase
  const cookieStore = await cookies(); // Await here
  const session = cookieStore.get("admin-session");

  // CHANGE: Use requireAdminAction (no params)
  const isAuthenticated = session?.value
    ? await requireAdminAction()
    : false;

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
        <div className="bg-red-100 p-4 rounded text-red-700 font-semibold">
          Not authenticated. Please <Link href="/admin/login" className="text-blue-600 hover:underline">log in</Link> as admin.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>
          <strong>Session Cookie:</strong> {session?.value || "Not found"}
        </p>
        <p>
          <strong>Is Authenticated:</strong> Yes
        </p>
      </div>
      <div className="mt-4">
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
