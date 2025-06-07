import { cookies } from "next/headers"
import { getMetadata } from "@/lib/seo-utils"

// --- SEO: Block search engines ---
export const metadata = getMetadata({
  title: "Admin Test Page",
  description: "Internal page for verifying admin authentication. Not for public indexing.",
  path: "/admin/test",
  robots: "noindex, nofollow",
})

export default async function AdminTest() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")

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
  )
}
