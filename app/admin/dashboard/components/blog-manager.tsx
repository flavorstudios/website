"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye, Calendar, Tag, Search, Filter } from "lucide-react"
import { createBlogPost, updateBlogPost, deleteBlogPost } from "../../actions"
import type { BlogPost } from "@/lib/admin-store"

interface BlogManagerProps {
  initialBlogs: BlogPost[]
}

export function BlogManager({ initialBlogs }: BlogManagerProps) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const BlogForm = ({ blog }: { blog?: BlogPost }) => (
    <form action={blog ? (formData) => updateBlogPost(blog.id, formData) : createBlogPost} className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={blog?.title}
                placeholder="Enter an engaging title..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={blog?.slug} placeholder="url-friendly-slug" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={blog?.excerpt}
              placeholder="Brief description for previews..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={blog?.content}
              placeholder="Write your amazing content here..."
              rows={12}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <Input
              id="featuredImage"
              name="featuredImage"
              defaultValue={blog?.featuredImage}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              name="seoTitle"
              defaultValue={blog?.seoTitle}
              placeholder="Optimized title for search engines..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={blog?.seoDescription}
              placeholder="Compelling description for search results..."
              rows={3}
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={blog?.category}
                placeholder="e.g., Anime, News, Tutorial"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={blog?.status || "draft"}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={blog?.tags?.join(", ")}
              placeholder="anime, studio, creative, art"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedAt">Publish Date</Label>
            <Input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={blog?.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : ""}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {blog ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingBlog(null)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
              <DialogDescription>
                {editingBlog
                  ? "Update your blog post content and settings"
                  : "Create engaging content for your audience"}
              </DialogDescription>
            </DialogHeader>
            <BlogForm blog={editingBlog || undefined} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
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
        </CardContent>
      </Card>

      {/* Blog Posts Grid */}
      <div className="grid gap-6">
        {filteredBlogs.map((blog) => (
          <Card key={blog.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {blog.featuredImage && (
                  <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={blog.featuredImage || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{blog.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{blog.excerpt}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(blog.status)}>{blog.status}</Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingBlog(blog)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this post?")) {
                              deleteBlogPost(blog.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(blog.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {blog.category}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {blog.views} views
                    </div>
                  </div>

                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBlogs.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first blog post"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
