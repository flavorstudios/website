import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Eye, Clock, ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { StructuredData } from "@/components/StructuredData"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { getMetadata } from "@/lib/seo/metadata"
import { getCanonicalUrl } from "@/lib/seo/canonical"
import { getSchema } from "@/lib/seo/schema"

// === TYPES ===
interface BlogPost {
  id: string
  slug: string
  title: string
  coverImage?: string
  category?: string
  publishedAt: string
  excerpt?: string
  readingTime?: string
  status?: string
}

interface LogPost {
  id: string
  slug: string
  title: string
  coverImage?: string
  category?: string
  publishedAt: string
  excerpt?: string
  readingTime?: string
  status?: string
}

// --- SEO: Metadata for Home Page ---
export const metadata = getMetadata({
  title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
})

// --- JSON-LD WebPage Schema ---
const schema = getSchema({
  type: "WebPage",
  path: "/",
  title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  image: `${SITE_URL}/cover.jpg`,
})

async function getHomePageContent() {
  const fallbackContent = {
    latestBlogs: [],
    featuredVideos: [],
    stats: null,
  }

  if (process.env.NODE_ENV === "development") return fallbackContent

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL
    const [statsResult, videosResult, blogsResult] = await Promise.allSettled([
      fetch(`${baseUrl}/api/admin/stats`, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${baseUrl}/api/admin/videos`, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${baseUrl}/api/admin/blogs`, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.json() : null)),
    ])

    const stats = statsResult.status === "fulfilled" && statsResult.value ? statsResult.value.stats : null
    const videos =
      videosResult.status === "fulfilled" && videosResult.value
        ? videosResult.value.videos?.filter((v: any) => v.status === "published") || []
        : []
    const blogs =
      blogsResult.status === "fulfilled" && blogsResult.value
        ? blogsResult.value.posts?.filter((p: BlogPost) => p.status === "published").slice(0, 6) || []
        : []

    return { stats, featuredVideos: videos, latestBlogs: blogs }
  } catch (error) {
    console.error("Failed to fetch homepage content:", error)
    return fallbackContent
  }
}

const ErrorFallback = ({ section }: { section: string }) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>
      <p className="text-gray-600 text-lg">Unable to load {section} content.</p>
      <p className="text-gray-500 text-sm mt-2">Please try again later.</p>
    </div>
  </div>
)

const BlogsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden border-0 shadow-lg">
        <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
        <CardHeader className="space-y-3">
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded-full w-16"></div>
            <div className="h-5 bg-gray-200 animate-pulse rounded w-20"></div>
          </div>
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
)

const VideosSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden border-0 shadow-lg">
        <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
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
)

const StatsSkeleton = () => (
  <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center bg-white rounded-2xl p-8 shadow-lg">
            <div className="h-16 bg-gray-200 animate-pulse rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default async function HomePage() {
  const content = await getHomePageContent()

  return (
    <div className="min-h-screen">
      {/* SEO: Inject JSON-LD */}
      {schema && <StructuredData schema={schema} />}

      {/* --- Enhanced Hero Section --- */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Badge with enhanced styling */}
            <div className="flex justify-center animate-fade-in">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-full border-0 shadow-2xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Independent Anime Studio
              </Badge>
            </div>

            {/* Enhanced heading */}
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
                Creating Stories That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient">
                  Inspire
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-200 leading-relaxed max-w-4xl mx-auto font-light">
                Welcome to Flavor Studios, where imagination meets animation. We craft original anime content, share
                industry insights, and bring unique stories to life through the art of animation.
              </p>
            </div>

            {/* Enhanced CTA */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 animate-fade-in-up delay-300">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Link href="/blog">
                  Explore Our Stories
                  <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-12 py-6 text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/watch">
                  <Play className="mr-3 h-6 w-6" />
                  Watch Now
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* --- Enhanced Stats Section --- */}
      {content.stats && (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-xl text-gray-600">Numbers that tell our story</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                  {content.stats.youtubeSubscribers ?? "—"}
                </div>
                <div className="text-gray-600 font-medium">YouTube Subscribers</div>
              </div>
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 text-white">Video</div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                  {content.stats.originalEpisodes ?? "—"}
                </div>
                <div className="text-gray-600 font-medium">Original Episodes</div>
              </div>
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-cyan-600 mb-2">
                  {content.stats.totalViews ?? "—"}
                </div>
                <div className="text-gray-600 font-medium">Total Views</div>
              </div>
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                  {content.stats.yearsCreating ?? "—"}
                </div>
                <div className="text-gray-600 font-medium">Years Creating</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Enhanced Blog Section --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Latest Stories
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Fresh from the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Studio</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dive into our latest articles covering anime reviews, industry insights, and creative storytelling.
            </p>
          </div>

          {content.latestBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {content.latestBlogs.map((post: BlogPost, index: number) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card
                    className={`h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border-0 shadow-lg group ${
                      index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                    }`}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={post.coverImage || "/placeholder.svg"}
                        alt={post.title || "Anime blog cover"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-900 hover:bg-white border-0 shadow-lg">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {post.readingTime || "5 min read"}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-blue-600 transition-colors duration-300">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <ErrorFallback section="blog posts" />
          )}

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              <Link href="/blog">
                View All Posts
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- Enhanced Newsletter Section --- */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Join Our Community
                </div>
                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  Stay in the{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Loop</span>
                </h2>
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                  Get the latest updates on our anime projects, industry insights, and exclusive behind-the-scenes
                  content delivered straight to your inbox.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <NewsletterSignup />
                <p className="text-sm text-blue-200 mt-4">Join 10,000+ anime enthusiasts. Unsubscribe anytime.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <span className="flex items-center gap-3 text-blue-200">
                  <div
                    className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                    aria-hidden="true"
                  ></div>
                  Weekly Updates
                </span>
                <span className="flex items-center gap-3 text-blue-200">
                  <div
                    className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                    aria-hidden="true"
                  ></div>
                  Exclusive Content
                </span>
                <span className="flex items-center gap-3 text-blue-200">
                  <div
                    className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                    aria-hidden="true"
                  ></div>
                  No Spam
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Enhanced Watch Section --- */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Play className="w-4 h-4" />
              Original Content
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Watch Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Originals
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience our original anime content, behind-the-scenes footage, and exclusive video content.
            </p>
          </div>

          {content.featuredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {content.featuredVideos.slice(0, 6).map((video: any) => (
                <Link key={video.id} href={`/watch/${video.id}`}>
                  <Card className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border-0 shadow-lg group">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title || "Anime video thumbnail"}
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="h-8 w-8 text-white ml-1" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {video.duration || "—"}
                      </div>
                      <div className="absolute top-3 left-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors duration-300">
                        {video.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          {(video.views || 0).toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <ErrorFallback section="video content" />
          )}

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-6 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              <Link href="/watch">
                View All Videos
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- Enhanced Call to Action Section --- */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        {/* Enhanced background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Ready to Create?
              </div>
              <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                Bring Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  Imagination
                </span>{" "}
                to Life
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                Ready to start your creative journey? Whether you want to collaborate, learn more about our process, or
                support our mission, we're here to help bring stories to life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-12 py-6 text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/30"
              >
                <Link href="/support">
                  Support Us
                  <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
