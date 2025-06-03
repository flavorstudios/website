import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Eye, BookOpen, Clock, Star } from "lucide-react"
import { blogStore } from "@/lib/content-store"
import { getDynamicCategories } from "@/lib/dynamic-categories"
import { CategoryTabs } from "@/components/ui/category-tabs"
import { NewsletterSignup } from "@/components/newsletter-signup"

// --- FETCH BLOG DATA AND CATEGORIES ---
async function getBlogData() {
  try {
    const [postsRaw, dynamicCategories] = await Promise.all([
      blogStore.getPublished(),
      getDynamicCategories(),
    ])
    // Defensive fallback if any are missing or misformatted
    const posts = Array.isArray(postsRaw) ? postsRaw : []
    const categories = Array.isArray(dynamicCategories?.blogCategories)
      ? dynamicCategories.blogCategories
      : []
    return { posts, categories }
  } catch (error) {
    console.error("Failed to fetch blog data:", error)
    return { posts: [], categories: [] }
  }
}

// --- MAIN PAGE ---
export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const { posts, categories } = await getBlogData()
  const selectedCategory = searchParams.category || "all"
  const currentPage = Number.parseInt(searchParams.page || "1")
  const postsPerPage = 9

  const makeSlug = (str: string) =>
    str?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count:
      typeof cat.count === "number"
        ? cat.count
        : posts.filter(
            post =>
              (post.categorySlug || makeSlug(post.category)) === cat.slug
          ).length,
  }))

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter(
          post =>
            (post.categorySlug || makeSlug(post.category)) === selectedCategory
        )

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const featuredPosts = filteredPosts.filter((post: any) => post.featured).slice(0, 3)
  const regularPosts = paginatedPosts.filter((post: any) => !post.featured)

  const totalViews = posts.reduce((sum: number, post: any) => sum + (post.views || 0), 0)
  const avgReadTime =
    posts.length > 0
      ? Math.round(
          posts.reduce(
            (sum: number, post: any) => sum + Number.parseInt(post.readTime?.replace(" min read", "") || "5"),
            0,
          ) / posts.length,
        )
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6 text-sm font-medium shadow-lg">
              <BookOpen className="h-4 w-4" />
              Studio Insights & Stories
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-relaxed px-4 pb-2">
              Flavor Studios Blog
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 italic font-light max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Behind the scenes of anime creation—one story at a time.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{posts.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Articles</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-100">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{categoriesWithCounts.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-green-100">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Views</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-100">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{avgReadTime}</div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Read Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Tabs */}
      <CategoryTabs
        categories={categoriesWithCounts}
        selectedCategory={selectedCategory}
        basePath="/blog"
        type="blog"
      />

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Featured Posts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredPosts.map((post: any, index: number) => (
                <FeaturedPostCard key={post.id} post={post} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "Latest Posts"
                  : `${categoriesWithCounts.find((c) => c.slug === selectedCategory)?.name || selectedCategory} Posts`}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState selectedCategory={selectedCategory} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                {regularPosts.map((post: any) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} selectedCategory={selectedCategory} />
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Stay Updated with Our Latest Stories</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Get exclusive behind-the-scenes content and industry insights delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  )
}

// --- Keep your existing FeaturedPostCard, BlogPostCard, Pagination, EmptyState components exactly as before! ---
