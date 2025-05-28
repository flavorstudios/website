import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Eye, Video, Clock, Star, ArrowRight, Users } from "lucide-react"
import { videoStore } from "@/lib/content-store"
import { getDynamicCategories } from "@/lib/dynamic-categories"
import { CategoryTabs } from "@/components/ui/category-tabs"

export const metadata = {
  title: "Watch | Flavor Studios - Original Anime Content & Series",
  description:
    "Watch our original anime content, behind-the-scenes videos, and exclusive series. Experience the art of animation through our creative lens.",
  keywords: "anime videos, original content, animation series, behind the scenes, anime episodes",
  openGraph: {
    title: "Watch Flavor Studios Content",
    description: "Bringing anime to life—one frame at a time.",
    type: "website",
    images: ["/placeholder.svg?height=630&width=1200&text=Watch+Flavor+Studios"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Flavor Studios",
    description: "Bringing anime to life—one frame at a time.",
  },
}

async function getWatchData() {
  try {
    const [videos, { videoCategories }] = await Promise.all([videoStore.getPublished(), getDynamicCategories()])

    return { videos, categories: videoCategories }
  } catch (error) {
    console.error("Failed to fetch watch data:", error)
    return { videos: [], categories: [] }
  }
}

export default async function WatchPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const { videos, categories } = await getWatchData()
  const selectedCategory = searchParams.category || "all"
  const currentPage = Number.parseInt(searchParams.page || "1")
  const videosPerPage = 9

  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((video: any) => {
          const categorySlug = video.category
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
          return categorySlug === selectedCategory
        })

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage)

  const featuredVideos = filteredVideos.filter((video: any) => video.featured).slice(0, 3)
  const regularVideos = paginatedVideos.filter((video: any) => !video.featured)

  // Analytics data
  const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0)
  const totalDuration = videos.reduce((sum: number, video: any) => {
    const duration = video.duration || "0:00"
    const [minutes, seconds] = duration.split(":").map(Number)
    return sum + (minutes || 0) + (seconds || 0) / 60
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            {/* Blue Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-6 py-2 mb-6 text-sm font-medium shadow-lg">
              <Video className="h-4 w-4" />
              Original Content & Series
            </div>

            {/* Gradient Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-tight">
              Watch Our Stories
            </h1>

            {/* Italic Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 italic font-light max-w-3xl mx-auto mb-8">
              Bringing anime to life—one frame at a time.
            </p>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{videos.length}</div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{Math.round(totalDuration)}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Tabs */}
      <CategoryTabs categories={categories} selectedCategory={selectedCategory} basePath="/watch" type="video" />

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Videos</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredVideos.map((video: any, index: number) => (
                <FeaturedVideoCard key={video.id} video={video} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "Latest Videos"
                  : `${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory} Videos`}
              </h2>
              <p className="text-gray-600">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {filteredVideos.length === 0 ? (
            <EmptyState selectedCategory={selectedCategory} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {regularVideos.map((video: any) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} selectedCategory={selectedCategory} />
              )}
            </>
          )}
        </div>
      </section>

      {/* YouTube CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Subscribe to Our YouTube Channel</h2>
          <p className="text-lg lg:text-xl mb-8 opacity-90">
            Get notified when we release new episodes and behind-the-scenes content.
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg">
            <Link href="https://youtube.com/@flavorstudios" target="_blank" rel="noopener noreferrer">
              <Users className="mr-2 h-5 w-5" />
              Subscribe Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeaturedVideoCard({ video, priority = false }: { video: any; priority?: boolean }) {
  return (
    <Link href={`/watch/${video.id}`} className="group">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-gradient-to-br from-white to-gray-50">
        <div className="relative h-48 lg:h-56 overflow-hidden">
          <img
            src={video.thumbnail || `/placeholder.svg?height=256&width=512&text=Featured+Video`}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg">
              ⭐ Featured
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-8 w-8 text-blue-600 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {video.duration || "0:00"}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {video.title}
          </CardTitle>
          <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">{video.description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              {video.category}
            </Badge>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(video.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function VideoCard({ video }: { video: any }) {
  return (
    <Link href={`/watch/${video.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25 bg-white">
        <div className="relative h-48 overflow-hidden">
          <img
            src={video.thumbnail || `/placeholder.svg?height=192&width=384&text=Video`}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6 text-blue-600 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white text-xs">
              {video.duration || "0:00"}
            </Badge>
          </div>
          {video.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              {video.category}
            </Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(video.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <CardTitle className="text-lg lg:text-xl line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {video.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed text-sm">{video.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {video.views?.toLocaleString() || 0} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {video.duration || "0:00"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function Pagination({
  currentPage,
  totalPages,
  selectedCategory,
}: { currentPage: number; totalPages: number; selectedCategory: string }) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (page > 1) params.set("page", page.toString())
    return `/watch${params.toString() ? `?${params.toString()}` : ""}`
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Button asChild variant="outline">
          <Link href={getPageUrl(currentPage - 1)}>Previous</Link>
        </Button>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button key={page} asChild variant={page === currentPage ? "default" : "outline"} size="sm">
          <Link href={getPageUrl(page)}>{page}</Link>
        </Button>
      ))}

      {currentPage < totalPages && (
        <Button asChild variant="outline">
          <Link href={getPageUrl(currentPage + 1)}>Next</Link>
        </Button>
      )}
    </div>
  )
}

function EmptyState({ selectedCategory }: { selectedCategory: string }) {
  return (
    <div className="text-center py-16 lg:py-20">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {selectedCategory === "all" ? "No videos yet" : `No videos in this category`}
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {selectedCategory === "all"
            ? "We're working on exciting video content! Check back soon for original anime episodes and behind-the-scenes footage."
            : `No videos have been published in this category yet. Try selecting a different category or check back later.`}
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            🎬 <strong>Content creators:</strong> Use the admin panel to publish your first video!
          </p>
        </div>
      </div>
    </div>
  )
}
