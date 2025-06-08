import { getMetadata } from "@/lib/seo-utils"

export const metadata = getMetadata({
  title: "Flavor Studios – Original Anime, Animation & Storytelling",
  description:
    "Flavor Studios is an independent anime and animation studio bringing stories to life with 3D animated content, original series, behind-the-scenes, and creative insights. Discover, watch, and be inspired.",
  path: "/",
  openGraph: {
    title: "Flavor Studios – Original Anime, Animation & Storytelling",
    description:
      "Flavor Studios is an independent anime and animation studio bringing stories to life with 3D animated content, original series, behind-the-scenes, and creative insights.",
    url: "https://flavorstudios.in/",
    type: "website",
    site_name: "Flavor Studios",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Flavor Studios – Original Anime, Animation & Storytelling",
    description:
      "Flavor Studios is an independent anime and animation studio bringing stories to life with 3D animated content, original series, behind-the-scenes, and creative insights.",
    image: "https://flavorstudios.in/cover.jpg",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flavor Studios",
    description:
      "Flavor Studios is an independent anime and animation studio bringing stories to life with 3D animated content, original series, behind-the-scenes, and creative insights.",
    url: "https://flavorstudios.in/",
    logo: {
      "@type": "ImageObject",
      url: "https://flavorstudios.in/logo.png",
    },
    sameAs: [
      "https://www.youtube.com/@flavorstudios",
      "https://www.instagram.com/flavorstudios",
      "https://twitter.com/flavor_studios",
      "https://www.facebook.com/flavourstudios",
      "https://www.threads.net/@flavorstudios",
    ],
  },
});

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Eye, Clock, ArrowRight } from "lucide-react"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { BackToTop } from "@/components/back-to-top"

async function getHomePageContent() {
  const fallbackContent = {
    latestBlogs: [],
    featuredVideos: [],
    stats: null,
  }

  // In development, return fallback content
  if (process.env.NODE_ENV === "development") {
    return fallbackContent
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Use Promise.allSettled to handle partial failures
    const [statsResult, videosResult, blogsResult] = await Promise.allSettled([
      fetch(`${baseUrl}/api/admin/stats`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${baseUrl}/api/admin/videos`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${baseUrl}/api/admin/blogs`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }).then((res) => (res.ok ? res.json() : null)),
    ])

    const stats = statsResult.status === "fulfilled" && statsResult.value ? statsResult.value.stats : null

    const videos =
      videosResult.status === "fulfilled" && videosResult.value
        ? videosResult.value.videos?.filter((v: any) => v.status === "published") || []
        : []

    const blogs =
      blogsResult.status === "fulfilled" && blogsResult.value
        ? blogsResult.value.posts?.filter((p: any) => p.status === "published").slice(0, 6) || []
        : []

    return {
      stats,
      featuredVideos: videos,
      latestBlogs: blogs,
    }
  } catch (error) {
    console.error("Failed to fetch homepage content:", error)
    return fallbackContent
  }
}

function ErrorFallback({ section }: { section: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Unable to load {section} content. Please try again later.</p>
    </div>
  )
}

function BlogsSkeleton() {
  return (
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
  )
}

function VideosSkeleton() {
  return (
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
  )
}

function StatsSkeleton() {
  return (
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
  )
}

export default async function HomePage() {
  const content = await getHomePageContent()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="max-w-4xl text-center space-y-8">
              <div className="flex justify-center">
                <Badge className="bg-blue-600 text-white px-6 py-3 text-base font-medium">
                  Independent Anime Studio
                </Badge>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Creating Stories That{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Inspire
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mx-auto">
                  Welcome to Flavor Studios, where imagination meets animation. We craft original anime content, share
                  industry insights, and bring unique stories to life through the art of animation.
                </p>
              </div>

              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Link href="/blog">
                    Explore Our Stories
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Only show if real stats are available */}
      {content.stats && (
        <Suspense fallback={<StatsSkeleton />}>
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                    {content.stats.youtubeSubscribers}
                  </div>
                  <div className="text-gray-600 font-medium">YouTube Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                    {content.stats.originalEpisodes}
                  </div>
                  <div className="text-gray-600 font-medium">Original Episodes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-cyan-600 mb-2">{content.stats.totalViews}</div>
                  <div className="text-gray-600 font-medium">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                    {content.stats.yearsCreating}
                  </div>
                  <div className="text-gray-600 font-medium">Years Creating</div>
                </div>
              </div>
            </div>
          </section>
        </Suspense>
      )}

      {/* Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Latest Blog Posts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dive into our latest articles covering anime reviews, industry insights, and creative storytelling.
            </p>
          </div>

          <Suspense fallback={<BlogsSkeleton />}>
            {content.latestBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {content.latestBlogs.map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      {post.coverImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.coverImage || "/placeholder.svg"}
                            alt={`Cover image for ${post.title}`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500">{post.readingTime || "5 min read"}</span>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg leading-tight">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <ErrorFallback section="blog posts" />
            )}
          </Suspense>

          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/blog">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
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
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Weekly Updates
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Exclusive Content
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  No Spam
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Watch Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Watch Our Originals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our original anime content, behind-the-scenes footage, and exclusive video content.
            </p>
          </div>

          <Suspense fallback={<VideosSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {content.featuredVideos.slice(0, 6).map((video: any) => (
                <Link key={video.id} href={`/watch/${video.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 leading-tight">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views?.toLocaleString() || "0"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </Suspense>

          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/watch">
                View All Videos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="max-w-4xl text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Bring Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Imagination
                </span>{" "}
                to Life
              </h2>

              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mx-auto">
                Ready to start your creative journey? Whether you want to collaborate, learn more about our process, or
                support our mission, we're here to help bring stories to life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg border-0"
                >
                  <Link href="/support">
                    Support Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BackToTop />
    </div>
  )
}
