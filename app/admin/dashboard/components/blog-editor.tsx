"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent } from "@/components/ui/dialog" // Preview Modal
import BlogPostRenderer from "@/components/BlogPostRenderer"    // Preview Renderer
import { RichTextEditor } from "./rich-text-editor"
import {
  Save, Eye, CalendarIcon, Upload, X, Clock, BookOpen, Tag, Settings, ArrowLeft, Info, ChevronDown,
} from "lucide-react"
import { toast } from "sonner"

export interface BlogCategory {
  name: string
  slug: string
  tooltip?: string
}

export interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  categories: string[]
  tags: string[]
  featuredImage: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  openGraphImage: string
  schemaType: string
  status: "draft" | "published" | "scheduled"
  featured: boolean
  publishedAt?: Date
  scheduledFor?: Date
  author: string
  wordCount: number
  readTime: string
}

export function BlogEditor({ initialPost }: { initialPost?: Partial<BlogPost> }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Init from initialPost if present
  const [post, setPost] = useState<BlogPost>(() => ({
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    content: initialPost?.content ?? "",
    excerpt: initialPost?.excerpt ?? "",
    category: initialPost?.category ?? "",
    categories: initialPost?.categories ?? (initialPost?.category ? [initialPost.category] : []),
    tags: initialPost?.tags ?? [],
    featuredImage: initialPost?.featuredImage ?? "",
    seoTitle: initialPost?.seoTitle ?? "",
    seoDescription: initialPost?.seoDescription ?? "",
    seoKeywords: initialPost?.seoKeywords ?? "",
    openGraphImage: initialPost?.openGraphImage ?? "",
    schemaType: initialPost?.schemaType ?? "Article",
    status: (initialPost?.status as BlogPost["status"]) ?? "draft",
    featured: initialPost?.featured ?? false,
    author: initialPost?.author ?? "Admin",
    wordCount: initialPost?.wordCount ?? 0,
    readTime: initialPost?.readTime ?? "1 min read",
    id: initialPost?.id,
    publishedAt: initialPost?.publishedAt ? new Date(initialPost.publishedAt) : undefined,
    scheduledFor: initialPost?.scheduledFor ? new Date(initialPost.scheduledFor) : undefined,
  }))

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [imageUploading, setImageUploading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories?type=blog", {
          credentials: "include",
        })
        const data = await response.json()
        const blogCategories: BlogCategory[] = data.categories?.map((cat: any) => ({
          name: cat.name,
          slug: cat.slug,
          tooltip: cat.tooltip ?? "",
        })) || []
        setCategories(blogCategories)
        if (post.categories.length === 0 && blogCategories.length > 0) {
          setPost((prev) => ({
            ...prev,
            category: blogCategories[0].slug,
            categories: [blogCategories[0].slug],
          }))
        }
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (post.title && (!post.slug || post.slug === "")) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setPost((prev) => ({ ...prev, slug }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.title])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.content])

  useEffect(() => {
    const autoSave = async () => {
      if (post.title || post.content) {
        await savePost(true)
      }
    }
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post])

  const savePost = async (isAutoSave = false) => {
    if (!isAutoSave) setSaving(true)
    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          category: post.categories[0] || post.category || "",
          publishedAt: post.status === "published" ? new Date() : undefined,
          scheduledFor: post.status === "scheduled" ? scheduledDate : undefined,
        }),
        credentials: "include",
      })
      if (response.ok) {
        const savedPost = await response.json()
        setPost((prev) => ({ ...prev, id: savedPost.id }))
        setLastSaved(new Date())
        toast.success(isAutoSave ? "Auto-saved" : "Post saved successfully!")
      } else {
        throw new Error("Save failed")
      }
    } catch (error) {
      console.error("Failed to save post:", error)
      toast.error(isAutoSave ? "Auto-save failed" : "Failed to save post")
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

  const handleImageSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleImageUpload = async (file: File) => {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const response = await fetch("/api/admin/blog/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      if (response.ok) {
        const { url } = await response.json()
        setPost((prev) => ({ ...prev, featuredImage: url }))
        setSelectedFile(null)
        toast.success("Image uploaded successfully!")
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error("Failed to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  const addTag = () => {
    const newTag = tagInput.trim()
    if (!newTag) return
    if (post.tags.includes(newTag)) {
      toast.warning("Tag already added!")
      return
    }
    setPost((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }))
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const selectedCategories = categories.filter((cat) =>
    post.categories.includes(cat.slug)
  )

  function formatDateTime(dt: Date) {
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <>
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header - UPDATED FOR MOBILE SUPPORT */}
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{post.id ? "Edit Post" : "Create New Post"}</h1>
              <p className="text-gray-600">Write and publish your blog content</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {formatDateTime(lastSaved)}
              </span>
            )}
            <Button variant="outline" onClick={() => savePost()} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            {/* 🟢 Preview Button */}
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
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
                <div>
                  <label className="block text-sm font-medium mb-2">Keywords</label>
                  <Input
                    value={post.seoKeywords}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        seoKeywords: e.target.value,
                      }))
                    }
                    placeholder="keyword1, keyword2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">OpenGraph Image URL</label>
                  <Input
                    value={post.openGraphImage}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        openGraphImage: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Schema Type</label>
                  <Input
                    value={post.schemaType}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        schemaType: e.target.value,
                      }))
                    }
                    placeholder="Article"
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
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Featured Post</span>
                  <Switch
                    checked={post.featured}
                    onCheckedChange={(featured) =>
                      setPost((prev) => ({ ...prev, featured }))
                    }
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
                  Categories & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multi-select categories */}
                <div>
                  <label className="block text-sm font-medium mb-2">Categories</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="truncate">
                          {post.categories.length > 0
                            ? post.categories
                                .map(
                                  (slug) =>
                                    categories.find((cat) => cat.slug === slug)?.name || slug
                                )
                                .join(", ")
                            : "Select categories"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-64 overflow-y-auto">
                      {categories.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category.slug}
                          checked={post.categories.includes(category.slug)}
                          onCheckedChange={(checked) => {
                            setPost((prev) => {
                              const categories = checked
                                ? [...prev.categories, category.slug]
                                : prev.categories.filter((c) => c !== category.slug)
                              return {
                                ...prev,
                                categories,
                                category: categories[0] || "",
                              }
                            })
                          }}
                          className="capitalize"
                        >
                          {category.name}
                          {category.tooltip && (
                            <Info className="ml-2 h-4 w-4 text-blue-400" title={category.tooltip} />
                          )}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedCategories[0]?.tooltip && (
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="h-3 w-3" /> {selectedCategories[0]?.tooltip}
                    </div>
                  )}
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
            {/* Featured Image Section */}
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPost((prev) => ({ ...prev, featuredImage: "" }))}
                        className="w-full"
                      >
                        Remove Image
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={imageUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imageUploading ? "Uploading..." : "Change Image"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-3">Upload featured image</p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageSelect(file)
                          handleImageUpload(file)
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outline"
                        disabled={imageUploading}
                        asChild
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span>{imageUploading ? "Uploading..." : "Choose Image"}</span>
                      </Button>
                    </label>
                    {selectedFile && (
                      <div className="text-xs text-gray-500 mt-2">{selectedFile.name}</div>
                    )}
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

      {/* 🟢 Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl overflow-y-auto max-h-screen">
          <BlogPostRenderer post={post} />
        </DialogContent>
      </Dialog>
    </>
  )
}
