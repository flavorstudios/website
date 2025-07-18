// app/blog/page.tsx

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Eye, BookOpen, Clock, Star } from "lucide-react";
// import { blogStore } from "@/lib/comment-store"; // <-- No longer needed!
import { getDynamicCategories } from "@/lib/dynamic-categories";
import { CategoryTabs } from "@/components/ui/category-tabs";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getMetadata } from "@/lib/seo-utils";
import { getCanonicalUrl } from "@/lib/seo/canonical";
import { getSchema } from "@/lib/seo/schema";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";

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
});

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
});

// --- DATA FETCHING (Updated: now uses /api/blogs) ---
async function getBlogData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
    const [postsRes, { blogCategories }] = await Promise.all([
      fetch(`${baseUrl}/api/blogs`, { next: { revalidate: 300 } }),
      getDynamicCategories("blog"),
    ]);

    let posts: any[] = [];
    if (postsRes.ok) {
      const data = await postsRes.json();
      posts = Array.isArray(data) ? data : data.posts || [];
    }

    return { posts, categories: blogCategories || [] };
  } catch (error) {
    console.error("Failed to fetch blog data:", error);
    return { posts: [], categories: [] };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const { posts, categories } = await getBlogData();
  const selectedCategory = searchParams.category || "all";
  const currentPage = Number.parseInt(searchParams.page || "1");
  const postsPerPage = 9;

  // Clean/normalize the slug for filtering
  const normalizeSlug = (name: string) =>
    name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post: any) => {
          const categorySlug = normalizeSlug(post.category);
          return categorySlug === selectedCategory;
        });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const featuredPosts = filteredPosts.filter((post: any) => post.featured).slice(0, 3);
  const regularPosts = paginatedPosts.filter((post: any) => !post.featured);

  // Analytics data
  const totalViews = posts.reduce((sum: number, post: any) => sum + (post.views || 0), 0);
  const avgReadTime =
    posts.length > 0
      ? Math.round(
          posts.reduce(
            (sum: number, post: any) => sum + Number.parseInt(post.readTime?.replace(" min read", "") || "5"),
            0,
          ) / posts.length,
        )
      : 0;

  // --- Category Name for clean heading ---
  const categoryName =
    categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory;

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
              Every post brings you closer to the anime universe.
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
                  : categoryName}
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

      {/* Newsletter CTA (MATCHES HOME PAGE) */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">Stay in the Loop</h2>
                <p className="text-xl md:text-2xl text-blue-100">
                  Get the latest updates on our anime projects, industry insights, and exclusive behind-the-scenes
                  content delivered straight to your inbox.
                </p>
              </div>
              <div className="max-w-md mx-auto relative">
                <NewsletterSignup />
                <p className="text-sm text-blue-200 mt-3">Join 10,000+ anime enthusiasts. Unsubscribe anytime.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                  Weekly Updates
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                  Exclusive Content
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
                  No Spam
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- COMPONENTS (as before) ---

function FeaturedPostCard({ post, priority = false }: { post: any; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-gradient-to-br from-white to-gray-50">
        <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
          <img
            src={post.featuredImage || post.coverImage || "/placeholder.svg?height=256&width=512&text=Featured+Post"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg text-xs">
              ⭐ Featured
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {post.title}
          </CardTitle>
          <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">{post.excerpt}</p>
        </CardHeader>
        <CardContent className="pt-0 p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{post.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{new Date(post.publishedAt).toLocaleDateString()}</span>
                <span className="sm:hidden">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                {post.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {post.readTime || "5 min"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BlogPostCard({ post }: { post: any }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25 bg-white">
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={post.featuredImage || post.coverImage || "/placeholder.svg?height=192&width=384&text=Blog+Post"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {post.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg text-xs">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
              {post.category}
            </Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">{new Date(post.publishedAt).toLocaleDateString()}</span>
              <span className="sm:hidden">
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </span>
          </div>
          <CardTitle className="text-base sm:text-lg lg:text-xl line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-4 sm:p-6">
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed text-sm">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1 font-medium">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{post.author}</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                {post.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {post.readTime || "5 min"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  selectedCategory,
}: { currentPage: number; totalPages: number; selectedCategory: string }) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (page > 1) params.set("page", page.toString());
    return `/blog${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {currentPage > 1 && (
        <Button asChild variant="outline" size="sm">
          <Link href={getPageUrl(currentPage - 1)}>Previous</Link>
        </Button>
      )}
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let page: number;
        if (totalPages <= 5) {
          page = i + 1;
        } else if (currentPage <= 3) {
          page = i + 1;
        } else if (currentPage >= totalPages - 2) {
          page = totalPages - 4 + i;
        } else {
          page = currentPage - 2 + i;
        }
        return (
          <Button key={page} asChild variant={page === currentPage ? "default" : "outline"} size="sm">
            <Link href={getPageUrl(page)}>{page}</Link>
          </Button>
        );
      })}
      {currentPage < totalPages && (
        <Button asChild variant="outline" size="sm">
          <Link href={getPageUrl(currentPage + 1)}>Next</Link>
        </Button>
      )}
    </div>
  );
}

function EmptyState({ selectedCategory }: { selectedCategory: string }) {
  return (
    <div className="text-center py-12 sm:py-16 lg:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {selectedCategory === "all" ? "No posts yet" : "No posts in this category"}
        </h3>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {selectedCategory === "all"
            ? "We're working on exciting content about anime, storytelling, and behind-the-scenes insights. Check back soon!"
            : "No posts have been published in this category yet. Try selecting a different category or check back later."}
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <p className="text-blue-800 text-sm">
            📝 <strong>Content creators:</strong> Use the admin panel to publish your first blog post!
          </p>
        </div>
      </div>
    </div>
  );
}
