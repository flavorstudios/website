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
import { ImageUpload } from "./image-upload"
import { Save, Eye, CalendarIcon, X, Clock, BookOpen, Tag, Settings, ArrowLeft, Star, FileText } from "lucide-react"

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
  ogImage?: string
  status: "draft" | "published" | "scheduled"
  featured: boolean
  publishedAt?: Date
  scheduledFor?: Date
  author: string
  wordCount: number
  readTime: string
  createdAt?: string
  updatedAt?: string
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
    ogImage: "",
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
  const [tagInput, setTagInput] = useState("")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // Load categories from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/blog/categories")
        const data = await response.json()
        setCategories(data.categories || [])

        if (!post.category && data.categories?.length > 0) {
          setPost((prev) => ({ ...prev, category: data.categories[0] }))
        }
      } catch (error) {
        console.error("Failed to load categories:", error)
        // Fallback categories
        const fallbackCategories = ["Anime Reviews", "Behind the Scenes", "Tutorials", "News & Updates"]
        setCategories(fallbackCategories)
        if (!post.category) {
          setPost((prev) => ({ ...prev, category: fallbackCategories[0] }))
        }
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
    if (!autoSaveEnabled) return

    const autoSave = async () => {
      if (post.title || post.content) {
        await savePost(true)
      }
    }

    const interval = setInterval(autoSave, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [post, autoSaveEnabled])

  // Auto-generate SEO title if empty
  useEffect(() => {
    if (post.title && !post.seoTitle) {
      setPost((prev) => ({ ...prev, seoTitle: post.title }))
    }
  }, [post.title])

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("folder", "blogImages")

    const response = await fetch("/api/admin/blog/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const data = await response.json()
    return data.url
  }

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
          updatedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const savedPost = await response.json()
        setPost((prev) => ({ ...prev, id: savedPost.id }))
        setLastSaved(new Date())

        if (!isAutoSave) {
          // Show success notification
          console.log("Post saved successfully!")
        }
      }
    } catch (error) {
      console.error("Failed to save post:", error)
      if (!isAutoSave) {
        alert("Failed to save post. Please try again.")
      }
    } finally {
      if (!isAutoSave) setSaving(false)
    }
  }

  const publishPost = async () => {
    if (!post.title || !post.content) {
      alert("Please add a title and content before publishing.")
      return
    }

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
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
              <p className="text-gray-600">Write and publish your content</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-sm text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Auto-save</span>
              <Switch checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
            </div>
            <Button variant="outline" onClick={() => savePost()} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={publishPost}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Publish Now
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Title & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Post Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
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
                  <p className="text-xs text-gray-500 mt-1">URL: flavorstudios.in/blog/{post.slug || "your-slug"}</p>
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
                  Content *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={post.content}
                  onChange={(content) => setPost((prev) => ({ ...prev, content }))}
                  onImageUpload={uploadImage}
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
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        seoDescription: e.target.value.slice(0, 160),
                      }))
                    }
                    placeholder="Brief description for search engines..."
                    rows={3}
                  />
                </div>

                <ImageUpload
                  value={post.ogImage}
                  onChange={(url) => setPost((prev) => ({ ...prev, ogImage: url }))}
                  onUpload={uploadImage}
                  label="Open Graph Image (Social Sharing)"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
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
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={post.category}
                    onValueChange={(category) => setPost((prev) => ({ ...prev, category }))}
                  >
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
                <ImageUpload
                  value={post.featuredImage}
                  onChange={(url) => setPost((prev) => ({ ...prev, featuredImage: url }))}
                  onUpload={uploadImage}
                  label="Blog Thumbnail"
                />
              </CardContent>
            </Card>

            {/* Post Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Post Statistics
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
                {post.featured && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Featured</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
