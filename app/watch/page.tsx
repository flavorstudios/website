"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Eye, Calendar, Youtube, Clock, Video, Star, ArrowRight } from "lucide-react"
import { CategoryTabs } from "@/components/ui/category-tabs"
import dynamic from "next/dynamic"

const CategoryDropdown = dynamic(() => import("@/components/ui/category-dropdown").then(mod => mod.CategoryDropdown), { ssr: false })

interface Video {
  id: string
  title: string
  category?: string
  status: string
  featured?: boolean
  views?: number
  duration?: string
}

interface CategoryData {
  name: string
  slug: string
  count: number
}

interface WatchPageProps {
  initialVideos: Video[]
  initialCategories: CategoryData[]
}

export default function WatchPage({ initialVideos, initialCategories }: WatchPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams?.get("category") || "all"
  const pageParam = parseInt(searchParams?.get("page") || "1", 10)

  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [currentPage, setCurrentPage] = useState(pageParam)
  const [videos] = useState(initialVideos)
  const [categories] = useState(initialCategories)

  const videosPerPage = 12

  // Normalize category slug for filtering consistency
  const normalizedSelectedCategory = selectedCategory
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  // Filter videos by category
  const filteredVideos =
    normalizedSelectedCategory === "all"
      ? videos
      : videos.filter((video) => {
          const categorySlug = video.category
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
          return categorySlug === normalizedSelectedCategory
        })

  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage)

  // Separate featured & regular videos
  const featuredVideos = filteredVideos.filter((video) => video.featured).slice(0, 3)
  const regularVideos = paginatedVideos.filter((video) => !video.featured)

  // Stats
  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0)
  const totalDuration = videos.reduce((sum, video) => {
    const duration = video.duration || "0:00"
    const [minutes, seconds] = duration.split(":").map(Number)
    return sum + (minutes || 0) + (seconds || 0) / 60
  }, 0)
  const avgDuration = videos.length > 0 ? Math.round(totalDuration / videos.length) : 0

  // Client-side category change
  function handleCategoryChange(newCategory: string) {
    setSelectedCategory(newCategory)
    setCurrentPage(1)
    router.push(`/watch?category=${newCategory}&page=1`, { scroll: true })
  }

  // Client-side page change
  function handlePageChange(newPage: number) {
    setCurrentPage(newPage)
    router.push(`/watch?category=${selectedCategory}&page=${newPage}`, { scroll: true })
  }

  const EmptyState = ({ selectedCategory }: { selectedCategory: string }) => (
    <div className="text-center py-12 sm:py-16 lg:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {selectedCategory === "all" ? "No videos yet" : `No videos in this category`}
        </h3>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {selectedCategory === "all"
            ? "We're working on exciting video content about anime creation, tutorials, and behind-the-scenes footage. Check back soon!"
            : `No videos have been published in this category yet. Try selecting a different category or check back later.`}
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <p className="text-blue-800 text-sm">
            🎬 <strong>Content creators:</strong> Use the admin panel to upload your first video!
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6 text-sm font-medium shadow-lg">
              <Video className="h-4 w-4" />
              Original Content & Series
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-relaxed px-4 pb-2">
              Watch Our Stories
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 italic font-light max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Bringing anime to life—one frame at a time.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{videos.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Videos</div>
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
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{avgDuration}</div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Duration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Dropdown */}
      <CategoryDropdown
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Category Tabs */}
      <CategoryTabs
        categories={[{ name: "All", slug: "all" }, ...categories]}
        selectedCategory={selectedCategory}
        basePath="/watch"
        type="video"
      />

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Featured Videos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredVideos.map((video, index) => (
                <FeaturedVideoCard key={video.id} video={video} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "Latest Videos"
                  : `${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory} Videos`}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                {regularVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  selectedCategory={selectedCategory}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* YouTube CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Subscribe to Our YouTube Channel</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Don't miss any of our latest content! Subscribe for weekly episodes, behind-the-scenes content, and anime
            news.
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg">
            <Link href="https://www.youtube.com/@flavorstudios" target="_blank" rel="noopener noreferrer">
              <Youtube className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Subscribe on YouTube
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
