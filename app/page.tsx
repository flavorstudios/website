import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Youtube, Calendar, Eye } from "lucide-react"

async function getHomePageContent() {
  // Default fallback data
  const defaultData = {
    stats: {
      youtubeSubscribers: "500K+",
      originalEpisodes: "50+",
      totalViews: "2M+",
      yearsCreating: "5",
    },
    hero: {
      badge: "Independent Anime Studio",
      title: "Welcome to Flavor Studios",
      description:
        "Your destination for original anime content, industry news, and creative storytelling. We're passionate creators bringing unique anime experiences to life.",
      ctaText: "Watch Our Content",
      ctaLink: "/watch",
    },
    about: {
      title: "Latest from Flavor Studios",
      description: "Stay updated with our newest anime content, industry insights, and behind-the-scenes stories.",
    },
    featuredVideos: [
      {
        id: 1,
        title: "Flavor Studios Original: Mystic Chronicles Episode 1",
        thumbnail: "/placeholder.svg?height=180&width=320&query=anime episode thumbnail mystic",
        duration: "24:30",
        views: 125000,
        publishedAt: "2024-01-15",
        featured: true,
        status: "published",
      },
      {
        id: 2,
        title: "Anime News Weekly: Latest Industry Updates",
        thumbnail: "/placeholder.svg?height=180&width=320&query=anime news studio setup",
        duration: "15:45",
        views: 89000,
        publishedAt: "2024-01-12",
        featured: true,
        status: "published",
      },
    ],
    latestBlogs: [
      {
        id: 1,
        title: "New Anime Season Preview: What to Watch This Fall",
        excerpt: "Discover the most anticipated anime releases coming this season...",
        publishedAt: "2024-01-15",
        category: "News",
        slug: "new-anime-season-preview",
        coverImage: "/placeholder.svg?height=200&width=300&query=anime season preview",
        status: "published",
      },
      {
        id: 2,
        title: "Behind the Scenes: Creating Our Latest Original Series",
        excerpt: "Take a look at our creative process and the making of our newest project...",
        publishedAt: "2024-01-12",
        category: "Studio Updates",
        slug: "behind-the-scenes-latest-series",
        coverImage: "/placeholder.svg?height=200&width=300&query=anime production behind scenes",
        status: "published",
      },
      {
        id: 3,
        title: "Top 10 Underrated Anime You Should Watch",
        excerpt: "Hidden gems that deserve more recognition in the anime community...",
        publishedAt: "2024-01-10",
        category: "Reviews",
        slug: "top-underrated-anime",
        coverImage: "/placeholder.svg?height=200&width=300&query=underrated anime collection",
        status: "published",
      },
    ],
  }

  // Only try to fetch from API in production or if we're sure the API exists
  if (process.env.NODE_ENV === "development") {
    return defaultData
  }

  try {
    // Try to fetch from API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""

    const [statsRes, videosRes, blogsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/admin/stats`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${baseUrl}/api/admin/videos`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${baseUrl}/api/admin/blogs`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
    ])

    clearTimeout(timeoutId)

    let stats = defaultData.stats
    let videos = defaultData.featuredVideos
    let blogs = defaultData.latestBlogs

    // Parse stats if successful
    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      try {
        const statsData = await statsRes.value.json()
        if (statsData && typeof statsData === "object") {
          stats = { ...defaultData.stats, ...statsData }
        }
      } catch (e) {
        console.log("Failed to parse stats JSON, using defaults")
      }
    }

    // Parse videos if successful
    if (videosRes.status === "fulfilled" && videosRes.value.ok) {
      try {
        const videosData = await videosRes.value.json()
        if (videosData?.videos && Array.isArray(videosData.videos)) {
          videos = videosData.videos.filter((v: any) => v.featured && v.status === "published").slice(0, 4)
          if (videos.length === 0) videos = defaultData.featuredVideos
        }
      } catch (e) {
        console.log("Failed to parse videos JSON, using defaults")
      }
    }

    // Parse blogs if successful
    if (blogsRes.status === "fulfilled" && blogsRes.value.ok) {
      try {
        const blogsData = await blogsRes.value.json()
        if (blogsData?.posts && Array.isArray(blogsData.posts)) {
          blogs = blogsData.posts.filter((p: any) => p.status === "published").slice(0, 3)
          if (blogs.length === 0) blogs = defaultData.latestBlogs
        }
      } catch (e) {
        console.log("Failed to parse blogs JSON, using defaults")
      }
    }

    return {
      ...defaultData,
      stats,
      featuredVideos: videos,
      latestBlogs: blogs,
    }
  } catch (error) {
    console.log("API fetch failed, using default data:", error)
    return defaultData
  }
}

export default async function HomePage() {
  const content = await getHomePageContent()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">{content.hero.badge}</Badge>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  {content.hero.title.split(" ").slice(0, 2).join(" ")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {content.hero.title.split(" ").slice(2).join(" ")}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">{content.hero.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={content.hero.ctaLink}>
                    <Play className="mr-2 h-5 w-5" />
                    {content.hero.ctaText}
                  </Link>
                </Button>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Featured Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">{content.stats.yearsCreating}</div>
              <div className="text-gray-600 font-medium">Years Creating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{content.about.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{content.about.description}</p>
          </div>

          {/* Featured Videos */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Youtube className="h-6 w-6 text-red-600" />
                Featured Videos
              </h3>
              <Button asChild variant="outline">
                <Link href="/watch">View All</Link>
              </Button>
            </div>

            <Suspense fallback={<VideosSkeleton />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.featuredVideos.map((video: any) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views.toLocaleString()}
                        </span>
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Suspense>
          </div>

          {/* Latest Blog Posts */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Latest Articles</h3>
              <Button asChild variant="outline">
                <Link href="/blog">View All</Link>
              </Button>
            </div>

            <Suspense fallback={<BlogsSkeleton />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content.latestBlogs.map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      {post.coverImage && (
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={post.coverImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}

function VideosSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <div className="h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
          <CardHeader>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-3 bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BlogsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <div className="h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
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
