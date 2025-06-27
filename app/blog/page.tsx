import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, Mail, Sparkles, ArrowRight, CheckCircle } from "lucide-react"
import { blogStore } from "@/lib/content-store"
import { getDynamicCategories } from "@/lib/dynamic-categories"
import { CategoryTabs } from "@/components/ui/category-tabs"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { getMetadata } from "@/lib/seo-utils"
import { getCanonicalUrl } from "@/lib/seo/canonical"
import { getSchema } from "@/lib/seo/schema"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { StructuredData } from "@/components/StructuredData"
import { FeaturedPostCard } from "@/components/FeaturedPostCard"
import { BlogPostCard } from "@/components/BlogPostCard"
import { Pagination } from "@/components/Pagination"
import { EmptyState } from "@/components/EmptyState"

// --- SEO METADATA (centralized, canonical, modular) ---
export const metadata = getMetadata({
  title: `${SITE_NAME} Blog | Anime News, Insights & Studio Stories`,
  description: `Explore the latest anime news, creative industry insights, and original studio stories from ${SITE_NAME}. Go behind the scenes with our team.`,
  path: "/blog",
  robots: "index,follow",
  openGraph: {
    title: `${SITE_NAME} Blog | Anime News, Insights & Studio Stories`,
    description: `Explore the latest anime news, creative industry insights, and original studio stories from ${SITE_NAME}. Go behind the scenes with our team.`,
    type: "website",
    url: getCanonicalUrl("/blog"),
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Blog – Anime News, Insights & Studio Stories`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} Blog | Anime News, Insights & Studio Stories`,
    description: `Explore the latest anime news, creative industry insights, and original studio stories from ${SITE_NAME}. Go behind the scenes with our team.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  alternates: {
    canonical: getCanonicalUrl("/blog"),
  },
})

// --- JSON-LD Schema.org (WebPage schema, logo only in publisher) ---
const schema = getSchema({
  type: "WebPage",
  path: "/blog",
  title: `${SITE_NAME} Blog | Anime News, Insights & Studio Stories`,
  description: `Explore the latest anime news, creative industry insights, and original studio stories from ${SITE_NAME}. Go behind the scenes with our team.`,
  image: {
    url: `${SITE_URL}/cover.jpg`,
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} Blog – Anime News, Insights & Studio Stories`,
  },
  organizationName: SITE_NAME,
  organizationUrl: SITE_URL,
  // logo ONLY here, schema.ts will attach under publisher/org not Thing root
})

// --- DATA FETCHING ---
async function getBlogData() {
  try {
    const [posts, { blogCategories }] = await Promise.all([blogStore.getPublished(), getDynamicCategories()])
    return { posts, categories: blogCategories }
  } catch (error) {
    console.error("Failed to fetch blog data:", error)
    return { posts: [], categories: [] }
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const { posts, categories } = await getBlogData()
  const selectedCategory = searchParams.category || "all"
  const currentPage = Number.parseInt(searchParams.page || "1")
  const postsPerPage = 9

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post: any) => {
          const categorySlug = post.category
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
          return categorySlug === selectedCategory
        })

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const featuredPosts = filteredPosts.filter((post: any) => post.featured).slice(0, 3)
  const regularPosts = paginatedPosts.filter((post: any) => !post.featured)

  // Analytics data
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
      {/* --- SEO JSON-LD Schema --- */}
      <StructuredData schema={schema} />

      {/* Header */}
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
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{categories.length}</div>
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

      {/* Category Tabs */}
      <CategoryTabs categories={categories} selectedCategory={selectedCategory} basePath="/blog" type="blog" />

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
                  : `${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory} Posts`}
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

      {/* Enhanced Newsletter CTA */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fillOpacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Exclusive Content</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Stay in the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Creative Loop
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Get exclusive behind-the-scenes content, industry insights, and early access to our latest anime stories delivered straight to your inbox.
              </p>

              {/* Benefits list */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
                {[
                  "Weekly studio updates",
                  "Exclusive interviews",
                  "Early story previews",
                  "Industry insights"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-100 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Newsletter form */}
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Join Our Creative Community
                  </CardTitle>
                  <p className="text-blue-100">
                    {"Join 2,500+ anime enthusiasts and creators"}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <NewsletterSignup />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-blue-200 mb-4">
                      No spam, unsubscribe at any time. We respect your privacy.
                    </p>
                    
                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-100">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span>Trusted by creators worldwide</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className="text-blue-100 mb-4">
              Ready to dive deeper into anime creation?
            </p>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm group"
            >
              Explore Our Stories
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
