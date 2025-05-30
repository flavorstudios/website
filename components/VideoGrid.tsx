"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Calendar } from "lucide-react"

interface Video {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  featured: boolean
}

interface VideoGridProps {
  videos?: Video[]
  category?: string
  searchQuery?: string
  limit?: number
}

export default function VideoGrid({ videos = [], category = "all", searchQuery = "", limit }: VideoGridProps) {
  const [filteredVideos, setFilteredVideos] = useState<Video[]>(videos)

  useEffect(() => {
    let filtered = videos

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((video) => video.category.toLowerCase() === category.toLowerCase())
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    setFilteredVideos(filtered)
  }, [videos, category, searchQuery, limit])

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos found</h3>
        <p className="text-gray-500">
          {searchQuery ? "Try adjusting your search terms." : "Check back later for new content."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredVideos.map((video) => (
        <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
          <Link href={`/watch/${video.slug}`}>
            <div className="relative aspect-video bg-gray-200">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="w-6 h-6 text-gray-800 fill-current" />
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>

              {/* Featured badge */}
              {video.featured && <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">Featured</Badge>}
            </div>
          </Link>

          <CardContent className="p-4">
            <Link href={`/watch/${video.slug}`}>
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                {video.title}
              </h3>
            </Link>

            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{video.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{video.duration}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {video.category}
              </Badge>

              {video.tags.length > 0 && (
                <div className="flex gap-1">
                  {video.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
