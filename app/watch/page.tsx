"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play } from "lucide-react"
import { CategoryTabs } from "@/components/ui/category-tabs"
import { getCategoriesWithFallback, type CategoryData } from "@/lib/dynamic-categories"

interface Video {
  id: string
  title: string
  slug: string
  description: string
  youtubeId: string
  thumbnail: string
  duration: string
  category: string
  publishedAt: string
  views: number
  featured: boolean
  episodeNumber?: number
  season?: string
}

export default function WatchPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [videosResponse, categoriesData] = await Promise.all([
        fetch("/api/admin/videos").catch(() => ({ ok: false, json: () => Promise.resolve({ videos: [] }) })),
        getCategoriesWithFallback(),
      ])

      let videosData = { videos: [] }
      if (videosResponse.ok) {
        videosData = await videosResponse.json()
      }

      const publishedVideos = (videosData.videos || []).filter((video: Video) => video.status === "published")
      setVideos(publishedVideos)
      setCategories(categoriesData.videoCategories)
    } catch (error) {
      console.error("Failed to load watch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter((video) => {
    if (selectedCategory === "all") return true
    return (
      video.category === selectedCategory ||
      video.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === selectedCategory
    )
  })

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const url = new URL(window.location.href)
    if (category === "all") {
      url.searchParams.delete("category")
    } else {
      url.searchParams.set("category", category)
    }
    window.history.pushState({}, "", url.toString())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
            <Play className="w-3 h-3 mr-2" />
            Watch
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-4">
            Anime & Video Content
          </h1>
          <p className="text-xl text-gray-600 italic max-w-2xl mx-auto">
            Experience our original anime series, short films, and exclusive behind-the-scenes content
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            className="mb-6"
          />
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <Link key={video.id} href={`/watch/${video.slug}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={video.thumbnail || "/placeholder.svg?height=200&width=400&text=Video+Thumbnail"}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-900 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                  {video.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{video.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
                    {video.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  {(video.episodeNumber || video.season) && (
                    <div className="mt-2 text-sm text-gray-500">
                      {video.season && `${video.season} `}
                      {video.episodeNumber && `Episode ${video.episodeNumber}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600">
              {selectedCategory === "all"
                ? "No videos are available at the moment."
                : `No videos found in the "${selectedCategory}" category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
