import type { Metadata } from "next"
import { BlogEditor } from "../../dashboard/components/blog-editor"

export const metadata: Metadata = {
  title: "Create New Post - Flavor Studios Admin",
  description: "Create and publish new blog posts for Flavor Studios",
  robots: "noindex, nofollow",
}

export default function CreateBlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogEditor />
      </div>
    </div>
  )
}
