import { cookies } from "next/headers";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

// --- SEO: Block search engines & keep internal-only metadata ---
export const metadata = getMetadata({
  title: `Admin Test – ${SITE_NAME}`,
  description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
  path: "/admin/test",
  robots: "noindex, nofollow", // Explicit and correct!
  openGraph: {
    title: `Admin Test – ${SITE_NAME}`,
    description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
    url: `${SITE_URL}/admin/test`, // Dynamically generated URL
    type: "website",
    site_name: SITE_NAME, // Automatically handled by the helper
    images: [
      {
        url: `${SITE_URL}/cover.jpg`, // Dynamically generated URL
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `Admin Test – ${SITE_NAME}`,
    description: `Internal admin test page for verifying authentication. Not publicly indexed.`,
    images: [`${SITE_URL}/cover.jpg`], // Dynamically generated URL
  },
  // Schema/JSON-LD intentionally removed (now in head.tsx)
});

export default async function AdminTest() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>
          <strong>Session Cookie:</strong> {session?.value || "Not found"}
        </p>
        <p>
          <strong>Is Authenticated:</strong> {session?.value === "authenticated" ? "Yes" : "No"}
        </p>
      </div>
      {session?.value === "authenticated" && (
        <div className="mt-4">
          <a href="/admin/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </a>
        </div>
      )}
    </div>
  );
}
