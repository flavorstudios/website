import type { Metadata } from "next"
import { BlogEditor } from "./components/blog-editor"

export const metadata: Metadata = {
  title: "Create New Blog Post - Flavor Studios Admin",
  description: "Create and publish new blog posts for Flavor Studios",
  robots: "noindex, nofollow",
}

export default function CreateBlogPage() {
  return <BlogEditor />
}
