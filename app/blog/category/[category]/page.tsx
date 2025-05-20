import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import blogCategories, { type BlogCategory } from "@/lib/blogCategories"
import { getPosts } from "@/lib/posts"

// Import the generateMetadata function
import { generateMetadata } from "./generateMetadata"

// Re-export the generateMetadata function
export { generateMetadata }

export default async function BlogCategoryPage({
  params,
}: {
  params: { category: string }
}) {
  // Check if the category exists
  if (!Object.keys(blogCategories).includes(params.category)) {
    notFound()
  }

  const category = params.category as BlogCategory
  const categoryData = blogCategories[category]

  // Get posts for this category
  const posts = await getPosts(category)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`${categoryData.color} ${categoryData.textColor} p-8 rounded-lg mb-8`}>
        <Link href="/blog" className="flex items-center mb-4 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all blog posts
        </Link>
        <h1 className="text-3xl font-bold mb-4">{categoryData.heading}</h1>
        <p className="text-lg">{categoryData.intro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {post.thumbnail && (
              <img src={post.thumbnail || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.summary}</p>
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
