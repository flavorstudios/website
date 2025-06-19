import { cookies } from "next/headers";
import { getMetadata } from "@/lib/seo-utils";

// --- SEO: Block search engines & keep internal-only metadata ---
export const metadata = getMetadata({
  title: "Admin Test – Flavor Studios",
  description: "Internal admin test page for verifying authentication. Not publicly indexed.",
  path: "/admin/test",
  robots: "noindex, nofollow", // Explicit and correct!
  openGraph: {
    title: "Admin Test – Flavor Studios",
    description: "Internal admin test page for verifying authentication. Not publicly indexed.",
    url: "https://flavorstudios.in/admin/test",
    type: "website",
    site_name: "Flavor Studios",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Admin Test – Flavor Studios",
    description: "Internal admin test page for verifying authentication. Not publicly indexed.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Admin Test – Flavor Studios",
    description: "Internal admin test page for verifying authentication. Not publicly indexed.",
    url: "https://flavorstudios.in/admin/test",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
      sameAs: [
        "https://www.youtube.com/@flavorstudios",
        "https://www.instagram.com/flavorstudios",
        "https://twitter.com/flavor_studios",
        "https://www.facebook.com/flavourstudios",
        "https://www.threads.net/@flavorstudios",
        "https://discord.com/channels/@flavorstudios",
        "https://t.me/flavorstudios",
        "https://www.reddit.com/r/flavorstudios/",
        "https://bsky.app/profile/flavorstudios.bsky.social"
      ]
    },
  },
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
