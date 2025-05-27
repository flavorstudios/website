"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  status: "published" | "draft" | "scheduled"
  publishedAt: string
  views: number
  featured: boolean
  seoTitle: string
  seoDescription: string
  coverImage: string
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [categories, setCategories] = useState<string[]>([])

  // Load posts from API
  useEffect(() => {
    loadPosts()
  }, [])

  // Add this useEffect to sync with categories
  useEffect(() => {
    // Load categories and sync with category store
    const syncCategories = async () => {
      try {
        await fetch("/api/admin/categories/sync", { method: "POST" })
        loadPosts()
      } catch (error) {
        console.error("Failed to sync categories:", error)
      }
    }

    syncCategories()
  }, [])

  // Update the loadPosts function to include category validation
  const loadPosts = async () => {
    try {
      const [postsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/blogs"),
        fetch("/api/admin/categories?type=blog"),
      ])

      const [postsData, categoriesData] = await Promise.all([postsResponse.json(), categoriesResponse.json()])

      setPosts(postsData.posts || [])

      // Update categories in the form
      const blogCategories =
        categoriesData.categories
          ?.filter((cat: any) => cat.type === "blog" && cat.isActive)
          ?.map((cat: any) => cat.name) || []
      setCategories(blogCategories)
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData: Partial<BlogPost>) => {
    try {
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        await loadPosts()
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        await loadPosts()
        setEditingPost(null)
      }
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadPosts()
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || post.status === filterStatus
    return matchesSearch && matchesStatus
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
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          <p className="text-gray-600">Manage your blog content and articles</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Create New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                    {post.featured && <Badge variant="outline">Featured</Badge>}
                    <span className="text-sm text-gray-500">{post.views.toLocaleString()} views</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingPost(post)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By {post.author}</span>
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingPost) && (
        <BlogPostForm
          post={editingPost}
          onSave={editingPost ? (data) => updatePost(editingPost.id, data) : createPost}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingPost(null)
          }}
          categories={categories}
        />
      )}
    </div>
  )
}

function BlogPostForm({
  post,
  onSave,
  onCancel,
  categories,
}: {
  post: BlogPost | null
  onSave: (data: Partial<BlogPost>) => void
  onCancel: () => void
  categories: string[]
}) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    category: post?.category || "",
    status: post?.status || "draft",
    featured: post?.featured || false,
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
    coverImage: post?.coverImage || "",
  })

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[0] }))
    }
  }, [categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    onSave({
      ...formData,
      slug,
      author: "Flavor Studios",
      publishedAt: post?.publishedAt || new Date().toISOString(),
      views: post?.views || 0,
      tags: ["anime", "studio", "content"],
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{post ? "Edit Post" : "Create New Post"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

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
                        <SelectItem key={category} value={category}>
                          {category}
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                  <Input
                    value={formData.coverImage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SEO Title</label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SEO Description</label>
                  <Textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    rows={3}
                  />
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
                    Featured Post
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="font-mono"
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                {post ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
