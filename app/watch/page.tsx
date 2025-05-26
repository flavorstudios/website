import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Eye, Calendar, Youtube } from "lucide-react"

async function getWatchPageContent() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/videos`, { cache: "no-store" })
    const data = await response.json()

    const publishedVideos = data.videos?.filter((v: any) => v.status === "published") || []
    const featuredVideos = publishedVideos.filter((v: any) => v.featured)
    const latestVideos = publishedVideos.slice(0, 8)

    return {
      featuredVideos,
      latestVideos,
      totalVideos: publishedVideos.length,
    }
  } catch (error) {
    console.error("Failed to fetch videos:", error)
    return {
      featuredVideos: [],
      latestVideos: [],
      totalVideos: 0,
    }
  }
}

export default async function WatchPage() {
  const content = await getWatchPageContent()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-red-600 text-white px-4 py-2 text-sm font-medium">
              Original Content & Series
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Watch Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">Content</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our original anime series, behind-the-scenes content, and the latest anime industry insights.
            </p>
            <div className="flex items-center justify-center gap-4 text-lg">
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {content.totalVideos} Videos
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Subscribe for Updates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      {content.featuredVideos.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Featured Content</h2>
            <Suspense fallback={<VideosSkeleton />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {content.featuredVideos.map((video: any) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button size="lg" className="bg-red-600 hover:bg-red-700">
                          <Play className="mr-2 h-5 w-5" />
                          Watch Now
                        </Button>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </div>
                      <Badge className="absolute top-4 left-4 bg-yellow-500">Featured</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{video.title}</CardTitle>
                      <p className="text-gray-600">{video.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {video.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline">{video.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Suspense>
          </div>
        </section>
      )}

      {/* Latest Videos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Latest Episodes & Videos</h2>
            <Button asChild variant="outline">
              <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
                <Youtube className="mr-2 h-4 w-4" />
                View All on YouTube
              </Link>
            </Button>
          </div>

          <Suspense fallback={<VideosSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.latestVideos.map((video: any) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">
                      {video.category}
                    </Badge>
                    <CardTitle className="line-clamp-2 text-lg">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {video.views.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Suspense>

          {content.latestVideos.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No videos yet</h3>
              <p className="text-gray-600 mb-8">Check back soon for exciting content from Flavor Studios!</p>
              <Button asChild>
                <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
                  <Youtube className="mr-2 h-4 w-4" />
                  Subscribe on YouTube
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* YouTube Channel CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our YouTube Channel</h2>
          <p className="text-xl mb-8 opacity-90">
            Don't miss any of our latest content! Subscribe for weekly episodes, behind-the-scenes content, and anime
            news.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
              <Youtube className="mr-2 h-5 w-5" />
              Subscribe on YouTube
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function VideosSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <CardHeader>
            <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
