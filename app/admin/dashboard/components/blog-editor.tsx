"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RichTextEditor } from "./rich-text-editor"
import { Save, Eye, CalendarIcon, Upload, X, Clock, BookOpen, Tag, Settings, ArrowLeft } from "lucide-react"

interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  featuredImage: string
  seoTitle: string
  seoDescription: string
  status: "draft" | "published" | "scheduled"
  featured: boolean
  publishedAt?: Date
  scheduledFor?: Date
  author: string
  wordCount: number
  readTime: string
}

export function BlogEditor() {
  const router = useRouter()
  const [post, setPost] = useState<BlogPost>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
    featured: false,
    author: "Admin",
    wordCount: 0,
    readTime: "1 min read",
  })

  const [categories, setCategories] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [imageUploading, setImageUploading] = useState(false)
  const [tagInput, setTagInput] = useState("")

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories")
        const data = await response.json()
        const blogCategories =
          data.categories?.filter((cat: any) => cat.type === "blog" && cat.isActive)?.map((cat: any) => cat.name) || []
        setCategories(blogCategories)

        if (!post.category && blogCategories.length > 0) {
          setPost((prev) => ({ ...prev, category: blogCategories[0] }))
        }
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (post.title && !post.slug) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setPost((prev) => ({ ...prev, slug }))
    }
  }, [post.title])

  // Calculate word count and read time
  useEffect(() => {
    const text = post.content.replace(/<[^>]*>/g, "")
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    const wordCount = words.length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    setPost((prev) => ({
      ...prev,
      wordCount,
      readTime: `${readTime} min read`,
    }))
  }, [post.content])

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (post.title || post.content) {
        await savePost(true)
      }
    }

    const interval = setInterval(autoSave, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [post])

  const savePost = async (isAutoSave = false) => {
    if (!isAutoSave) setSaving(true)

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          publishedAt: post.status === "published" ? new Date() : undefined,
          scheduledFor: post.status === "scheduled" ? scheduledDate : undefined,
        }),
      })

      if (response.ok) {
        const savedPost = await response.json()
        setPost((prev) => ({ ...prev, id: savedPost.id }))
        setLastSaved(new Date())

        if (!isAutoSave) {
          // Show success message
          console.log("Post saved successfully!")
        }
      }
    } catch (error) {
      console.error("Failed to save post:", error)
    } finally {
      if (!isAutoSave) setSaving(false)
    }
  }

  const publishPost = async () => {
    setPost((prev) => ({ ...prev, status: "published" }))
    await savePost()
    router.push("/admin/dashboard?tab=blogs")
  }

  const schedulePost = async () => {
    if (scheduledDate) {
      setPost((prev) => ({ ...prev, status: "scheduled" }))
      await savePost()
      setShowScheduler(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setImageUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/admin/blog/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        setPost((prev) => ({ ...prev, featuredImage: url }))
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setImageUploading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600">Write and publish your blog content</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && <span className="text-sm text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
          <Button variant="outline" onClick={() => savePost()} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={publishPost}
            className="bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={post.title}
                  onChange={(e) => setPost((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your blog post title..."
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <Input
                  value={post.slug}
                  onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <Textarea
                  value={post.excerpt}
                  onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of your post..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={post.content}
                onChange={(content) => setPost((prev) => ({ ...prev, content }))}
                placeholder="Start writing your blog post..."
              />
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SEO Title</label>
                <Input
                  value={post.seoTitle}
                  onChange={(e) => setPost((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO optimized title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Description ({post.seoDescription.length}/160)
                </label>
                <Textarea
                  value={post.seoDescription}
                  onChange={(e) => setPost((prev) => ({ ...prev, seoDescription: e.target.value.slice(0, 160) }))}
                  placeholder="Brief description for search engines..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Featured Post</span>
                <Switch
                  checked={post.featured}
                  onCheckedChange={(featured) => setPost((prev) => ({ ...prev, featured }))}
                />
              </div>

              <Popover open={showScheduler} onOpenChange={setShowScheduler}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Post
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                  />
                  <div className="p-3 border-t">
                    <Button onClick={schedulePost} disabled={!scheduledDate} className="w-full">
                      Schedule
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={post.category} onValueChange={(category) => setPost((prev) => ({ ...prev, category }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              {post.featuredImage ? (
                <div className="space-y-3">
                  <img
                    src={post.featuredImage || "/placeholder.svg"}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setPost((prev) => ({ ...prev, featuredImage: "" }))}
                    className="w-full"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-3">Upload featured image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" disabled={imageUploading} asChild>
                      <span>{imageUploading ? "Uploading..." : "Choose Image"}</span>
                    </Button>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Post Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Word Count</span>
                <span className="text-sm font-medium">{post.wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Read Time</span>
                <span className="text-sm font-medium">{post.readTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Author</span>
                <span className="text-sm font-medium">{post.author}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
