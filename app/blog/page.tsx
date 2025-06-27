// app/blog/page.tsx

import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Eye, BookOpen, Clock, Star, ArrowRight } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { blogStore } from "@/lib/content-store";
import { getDynamicCategories } from "@/lib/dynamic-categories";
import { CategoryTabs } from "@/components/ui/category-tabs";
// Import the helper needed for canonicalizing URLs in schema publisher
import { getAbsoluteCanonicalUrlForSchema } from "@/lib/seo/schema"; // This helper is crucial for schema URLs.

// === TYPES ===
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  coverImage?: string;
  category?: string;
  publishedAt: string;
  excerpt?: string;
  readingTime?: string;
  status?: string; // Expecting "published" or "draft"
}

interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  publishedAt?: string;
  status?: string;
}

// --- SEO METADATA (Centralized, dynamic) ---
export const metadata = getMetadata({
  title: "Flavor Studios Blog | Anime News, Insights & Studio Stories",
  description:
    "Explore the latest anime news, creative industry insights, and original studio stories from Flavor Studios. Go behind the scenes with our team.",
  path: "/blog",
  robots: "index,follow",
  openGraph: {
    title: "Flavor Studios Blog | Anime News, Insights & Studio Stories",
    description:
      "Explore the latest anime news, creative industry insights, and original studio stories from Flavor Studios. Go behind the scenes with our team.",
    type: "website",
    url: getCanonicalUrl("/blog"),
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: "Flavor Studios Blog – Anime News, Insights & Studio Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: "Flavor Studios Blog | Anime News, Insights & Studio Stories",
    description:
      "Explore the latest anime news, creative industry insights, and original studio stories from Flavor Studios. Go behind the scenes with our team.",
    images: [`${SITE_URL}/cover.jpg`],
  },
  alternates: {
    canonical: getCanonicalUrl("/blog"),
  },
});

// --- JSON-LD Blog Schema ---
// For 'Blog' type, getSchema does NOT automatically add publisher.
// So, we explicitly add it here with correct @type and canonical URLs for its properties.
const schema = getSchema({
  type: "Blog", // Schema.org Blog type (not BlogPosting)
  path: "/blog",
  name: "Flavor Studios Blog", // 'name' maps to title for Blog type
  description:
    "Explore the latest anime news, creative industry insights, and original studio stories from Flavor Studios. Go behind the scenes with our team.",
  url: getCanonicalUrl("/blog"),
  // CRITICAL FIX: Explicitly defining publisher for 'Blog' type, as getSchema doesn't auto-add it.
  // Must be a fully valid Organization object.
  publisher: {
    "@type": "Organization", // CRITICAL: Specify @type for the publisher object.
    name: SITE_NAME,
    url: getAbsoluteCanonicalUrlForSchema(SITE_URL), // Canonical URL for the publisher's website.
    logo: {
      "@type": "ImageObject",
      url: getAbsoluteCanonicalUrlForSchema(SITE_LOGO_URL), // Canonical URL for the publisher's logo.
      width: 600, // Standard logo width.
      height: 60, // Standard logo height.
      caption: `${SITE_NAME} logo`, // Description for the logo.
    },
  },
});

// --- DATA FETCHING ---
async function getBlogData() {
  try {
    // Ensure blogStore.getPublished() and getDynamicCategories()
    // internally use fetch with appropriate { next: { revalidate: <seconds> }} caching.
    const [posts, { blogCategories }] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      getDynamicCategories().catch(() => ({ blogCategories: [] })), // Added catch for getDynamicCategories
    ]);
    return { posts, categories: blogCategories };
  } catch (error) {
    console.error("Failed to fetch blog data:", error);
    return { posts: [], categories: [] };
  }
}

// --- Error/Loading Fallback Components ---
const ErrorFallback = ({ section }: { section: string }) => (
  <div className="text-center py-12">
    <p className="text-gray-500">Unable to load {section} content. Please try again later.</p>
  </div>
);

const BlogsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="h-48 bg-gray-200 animate-pulse"></div>
        <CardHeader>
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const VideosSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="h-48 bg-gray-200 animate-pulse"></div>
        <CardHeader>
          <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StatsSkeleton = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-12 bg-gray-200 animate-pulse rounded mb-2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);


// --- MAIN PAGE COMPONENT ---
export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const { posts, categories } = await getBlogData();
  const selectedCategory = searchParams.category || "all";
  const currentPage = Number.parseInt(searchParams.page || "1");
  const postsPerPage = 9;

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post: any) => {
          const categorySlug = post.category
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- SEO JSON-LD Schema --- */}
      <StructuredData schema={schema} />

      {/* Enhanced Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6 text-sm font-medium shadow-lg">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> {/* Added aria-hidden */}
              Studio Insights & Stories
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-relaxed px-4 pb-2">
              Flavor Studios Blog
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 italic font-light max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Behind the scenes of anime creation—one story at a time.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
              <StatCard label="Articles" value={posts.length} color="blue" />
              <StatCard label="Categories" value={categories.length} color="purple" />
              <StatCard label="Total Views" value={totalViews.toLocaleString()} color="green" />
              <StatCard label="Avg Read Time" value={avgReadTime} color="orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Tabs */}
      <CategoryTabs categories={categories} selectedCategory={selectedCategory} basePath="/blog" type="blog" />

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" aria-hidden="true" /> {/* Added aria-hidden */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Featured Posts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredPosts.map((post: BlogPost, index: number) => (
                <FeaturedPostCard key={post.id} post={post} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Section */}
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
                {regularPosts.map((post: BlogPost) => (
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

      {/* Newsletter CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Stay Updated with Our Latest Stories</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Get exclusive behind-the-scenes content and industry insights delivered straight to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200 mt-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div> {/* Added aria-hidden */}
              Weekly Updates
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div> {/* Added aria-hidden */}
              Exclusive Content
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div> {/* Added aria-hidden */}
              No Spam
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- COMPONENTS ---

// --- StatCard (for header stats) ---
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50",
    purple: "text-purple-600 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50",
    green: "text-green-600 border-green-100 bg-gradient-to-br from-green-50 to-blue-50",
    orange: "text-orange-600 border-orange-100 bg-gradient-to-br from-orange-50 to-red-50",
  };
  return (
    <div className={`${colorMap[color]} rounded-lg p-3 sm:p-4 border`}>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <div className="text-xs sm:text-sm text-gray-600">{label}</div>
    </div>
  );
}

// --- BadgeDot ---
function BadgeDot({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true" />
      {children}
    </span>
  );
}

// --- FeaturedPostCard ---
function FeaturedPostCard({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-gradient-to-br from-white to-gray-50">
        <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
          <img
            src={post.coverImage || "/placeholder.svg?height=256&width=512&text=Featured+Post"}
            alt={post.title || "Featured blog post cover"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg text-xs">
              ⭐ Featured
            </Badge>
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Badge variant="secondary" className="mb-2 bg-white/90 backdrop-blur-sm text-xs">
              {post.category}
            </Badge>
            <h3 className="text-sm sm:text-lg font-bold text-white mb-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {post.title}
            </h3>
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
                <User className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                <span className="truncate">{post.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{new Date(post.publishedAt).toLocaleDateString()}</span>
                <span className="sm:hidden">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                {(post.views || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                {post.readingTime || "5 min"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// --- BlogPostCard ---
function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25 bg-white">
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={post.coverImage || "/placeholder.svg?height=192&width=384&text=Blog+Post"}
            alt={post.title || "Blog post cover"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
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
              <Calendar className="h-3 w-3" aria-hidden="true" />
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
              <User className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="truncate">{post.author}</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                {(post.views || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                {post.readTime || "5 min"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// --- Pagination ---
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

// --- EmptyState ---
function EmptyState({ selectedCategory }: { selectedCategory: string }) {
  return (
    <div className="text-center py-12 sm:py-16 lg:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" aria-hidden="true" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {selectedCategory === "all" ? "No posts yet" : "No posts in this category"}
        </h3>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {selectedCategory === "all"
            ? "We're working on exciting content about anime, storytelling, and behind-the-scenes insights. Check back soon!"
            : `No posts have been published in this category yet. Try selecting a different category or check back later.`}
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
