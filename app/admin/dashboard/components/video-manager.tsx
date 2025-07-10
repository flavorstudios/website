"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryDropdown } from "@/components/ui/category-dropdown"

interface Category {
  id: string
  name: string
  slug: string
  type: "BLOG" | "VIDEO"
  description?: string
  color?: string
  icon?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  postCount: number
}

interface Video {
  id: string
  title: string
  slug: string
  description: string
  youtubeId: string
  thumbnail: string
  duration: string
  category: string
  tags: string[]
  status: "published" | "draft" | "unlisted"
  publishedAt: string
  views: number
  featured: boolean
  episodeNumber?: number
  season?: string
}

export function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Use unified categories endpoint
      const [videosRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/videos"),
        fetch("/api/categories"),
      ])
      const videosData = (await videosRes.json()).videos || []
      // Pick only video categories
      const allCategories = (await categoriesRes.json()).videoCategories || []
      setVideos(videosData)
      setCategories(allCategories)
    } catch (error) {
      console.error("Failed to load videos or categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const createVideo = async (videoData: Partial<Video>) => {
    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoData),
      })

      if (response.ok) {
        await loadData()
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error("Failed to create video:", error)
    }
  }

  const updateVideo = async (id: string, videoData: Partial<Video>) => {
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoData),
      })

      if (response.ok) {
        await loadData()
        setEditingVideo(null)
      }
    } catch (error) {
      console.error("Failed to update video:", error)
    }
  }

  const deleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Failed to delete video:", error)
    }
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || video.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Manager</h2>
          <p className="text-gray-600">Manage your YouTube content and episodes</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Add New Video
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <Input
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <CategoryDropdown
          categories={[
            { name: "All", slug: "all", count: videos.length },
            ...categories.map((cat) => ({
              name: cat.name,
              slug: cat.slug,
              count: cat.postCount,
            })),
          ]}
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          type="video"
        />
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
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
              {video.featured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-yellow-500">Featured</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={video.status === "published" ? "default" : "secondary"}>{video.status}</Badge>
                <Badge variant="outline">{video.category}</Badge>
                <span className="text-sm text-gray-500">{video.views.toLocaleString()} views</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{new Date(video.publishedAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingVideo(video)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteVideo(video.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingVideo) && (
        <VideoForm
          video={editingVideo}
          onSave={editingVideo ? (data) => updateVideo(editingVideo.id, data) : createVideo}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingVideo(null)
          }}
          categories={categories}
        />
      )}
    </div>
  )
}

function VideoForm({
  video,
  onSave,
  onCancel,
  categories,
}: {
  video: Video | null
  onSave: (data: Partial<Video>) => void
  onCancel: () => void
  categories: Category[]
}) {
  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    youtubeId: video?.youtubeId || "",
    category: video?.category || "",
    status: video?.status || "draft",
    featured: video?.featured || false,
    episodeNumber: video?.episodeNumber || "",
    season: video?.season || "",
  })

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[0].name }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/ // keep for full coverage
    const match = url.match(regex)
    return match ? match[1] : url
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const youtubeId = extractYouTubeId(formData.youtubeId)
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    onSave({
      ...formData,
      youtubeId,
      slug,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      duration: "10:30", // You can implement duration detection
      publishedAt: video?.publishedAt || new Date().toISOString(),
      views: video?.views || 0,
      tags: ["anime", "flavor studios"],
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{video ? "Edit Video" : "Add New Video"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">YouTube URL or ID</label>
              <Input
                value={formData.youtubeId}
                onChange={(e) => setFormData((prev) => ({ ...prev, youtubeId: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or video ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Episode Number</label>
                <Input
                  type="number"
                  value={formData.episodeNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, episodeNumber: e.target.value }))}
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Season</label>
                <Input
                  value={formData.season}
                  onChange={(e) => setFormData((prev) => ({ ...prev, season: e.target.value }))}
                  placeholder="Season 1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured Video
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                {video ? "Update Video" : "Add Video"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
