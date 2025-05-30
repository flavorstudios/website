import type { Metadata } from "next"
import { BlogHeader } from "@/components/blog/blog-header"
import { BlogList } from "@/components/blog/blog-list"
import { BlogCategories } from "@/components/blog/blog-categories"
import { getDynamicCategories } from "@/lib/categories"
import { blogStore } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog",
  description: "Read articles, tutorials, and news about web development.",
}

async function getBlogData() {
  try {
    const [posts, { blogCategories }] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      getDynamicCategories().catch(() => ({
        blogCategories: [
          { name: "Episodes", slug: "episodes", count: 0, order: 0 },
          { name: "Shorts", slug: "shorts", count: 0, order: 1 },
          { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0, order: 2 },
          { name: "Tutorials", slug: "tutorials", count: 0, order: 3 },
        ],
        videoCategories: [],
      })),
    ])

    return { posts, categories: blogCategories }
  } catch (error) {
    console.error("Failed to fetch blog data:", error)
    // Return static fallback
    return {
      posts: [],
      categories: [
        { name: "Episodes", slug: "episodes", count: 0, order: 0 },
        { name: "Shorts", slug: "shorts", count: 0, order: 1 },
        { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0, order: 2 },
        { name: "Tutorials", slug: "tutorials", count: 0, order: 3 },
      ],
    }
  }
}

export default async function BlogPage() {
  const { posts, categories } = await getBlogData()

  return (
    <div className="container relative">
      <BlogHeader />
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="mt-8 lg:col-span-3">
          <BlogList posts={posts} />
        </div>
        <aside className="mt-8 lg:col-span-1">
          <BlogCategories categories={categories} />
        </aside>
      </div>
    </div>
  )
}
