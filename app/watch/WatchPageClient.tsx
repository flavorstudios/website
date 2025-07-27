"use client"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Eye, Calendar, Youtube, Clock, Video } from "lucide-react"
import { useState, useEffect } from "react"
import type { Category } from "@/types/category" // <-- Unified import

interface VideoType {
  id: string
  title: string
  slug: string
  description: string
  youtubeId: string
  thumbnail: string
  duration: string
  category: string // Always slug!
  tags: string[]
  status: string
  publishedAt: string
  views: number
  featured: boolean
}

export function WatchPageClient({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const selectedCategory = searchParams.category || "all"

  useEffect(() => {
    fetchWatchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWatchData = async () => {
    try {
      setLoading(true)
      const [videosResponse, categoriesResponse] = await Promise.all([
        fetch("/api/videos", { cache: "no-store" }),
        fetch("/api/categories?type=video", { cache: "no-store" }),
      ])

      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        // Handles both array and { videos: [...] }
        const allVideos: VideoType[] = Array.isArray(videosData)
          ? videosData
          : videosData.videos || []
        const publishedVideos = allVideos.filter(
          (video: VideoType) => video.status === "published"
        )
        setVideos(publishedVideos)
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(
          (categoriesData.categories || []).map((cat: Category) => ({
            id: cat.id || cat.slug,
            name: cat.name,
            slug: cat.slug,
            color: cat.color,
            tooltip: cat.tooltip,
          }))
        )
      }
    } catch (error) {
      console.error("Failed to fetch watch data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by category SLUG
  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((video) => video.category === selectedCategory)

  const featuredVideos = filteredVideos.filter((video) => video.featured)
  const regularVideos = filteredVideos.filter((video) => !video.featured)

  // Get category name for proper heading
  const categoryName =
    categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Beautiful Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-6 py-2 mb-6 text-sm font-medium">
              <Video className="h-4 w-4" />
              Original Content & Series
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
              Watch Our Stories
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 italic font-light max-w-3xl mx-auto">
              Bringing anime to life—one frame at a time.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {videos.length} Videos Available
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                Subscribe for Updates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <section className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Browse by Category</h3>
            <CategoryFilter categories={categories} selectedCategory={selectedCategory} />
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredVideos.slice(0, 2).map((video) => (
                <FeaturedVideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory === "all"
                ? "Latest Videos"
                : categoryName}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
              </span>
              <Button asChild variant="outline">
                <Link href="https://www.youtube.com/@flavorstudios" target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-4 w-4" />
                  View All on YouTube
                </Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <VideosSkeleton />
          ) : filteredVideos.length === 0 ? (
            <EmptyState selectedCategory={selectedCategory} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YouTube Channel CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our YouTube Channel</h2>
          <p className="text-xl mb-8 opacity-90">
            Don&apos;t miss any of our latest content! Subscribe for weekly episodes, behind-the-scenes content, and anime news.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="https://www.youtube.com/@flavorstudios" target="_blank" rel="noopener noreferrer">
              <Youtube className="mr-2 h-5 w-5" />
              Subscribe on YouTube
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

// --- Components ---

function FeaturedVideoCard({ video }: { video: VideoType }) {
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`

  return (
    <Link href={`/watch/${video.slug}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-64 w-full">
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 512px"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Play className="mr-2 h-5 w-5" />
              Watch Now
            </Button>
          </div>
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {video.duration}
          </div>
          <Badge className="absolute top-4 left-4 bg-yellow-500">Featured</Badge>
        </div>
        <CardHeader>
          <Badge variant="secondary" className="w-fit mb-2">
            {video.category}
          </Badge>
          <CardTitle className="text-xl line-clamp-2">{video.title}</CardTitle>
          <p className="text-gray-600 line-clamp-2">{video.description}</p>
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
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function VideoCard({ video }: { video: VideoType }) {
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`

  return (
    <Link href={`/watch/${video.slug}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25">
        <div className="relative h-48 w-full">
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 384px"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {video.duration}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
            <div className="bg-blue-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </div>
        <CardHeader className="pb-2">
          <Badge variant="secondary" className="w-fit mb-2 border-blue-200 text-blue-700 bg-blue-50">
            {video.category}
          </Badge>
          <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
            {video.title}
          </CardTitle>
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
    </Link>
  )
}

function VideosSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

function EmptyState({ selectedCategory }: { selectedCategory: string }) {
  return (
    <div className="text-center py-20">
      <div className="max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {selectedCategory === "all" ? "No videos yet" : `No videos in ${selectedCategory}`}
        </h3>
        <p className="text-gray-600 mb-6">
          {selectedCategory === "all"
            ? "Come back soon for new updates! We&apos;re creating amazing original anime content, tutorials, and behind-the-scenes videos."
            : `No videos have been published in the ${selectedCategory} category yet. Try selecting a different category or check back later.`}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            🎬 <strong>Content creators:</strong> Use the admin panel to add your first video!
          </p>
        </div>
        <Button asChild>
          <Link href="https://www.youtube.com/@flavorstudios" target="_blank" rel="noopener noreferrer">
            <Youtube className="mr-2 h-4 w-4" />
            Subscribe on YouTube
          </Link>
        </Button>
      </div>
    </div>
  )
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
}

function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  return (
    <Select
      value={selectedCategory}
      onValueChange={(value) => {
        const url = new URL(window.location.href)
        if (value === "all") {
          url.searchParams.delete("category")
        } else {
          url.searchParams.set("category", value)
        }
        window.location.href = url.toString()
      }}
    >
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.slug} value={category.slug}>
            {category.name}
            {category.tooltip && (
              <span className="block text-xs text-gray-500 mt-1">{category.tooltip}</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
