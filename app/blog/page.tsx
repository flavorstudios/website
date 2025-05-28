"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryTabs } from "@/components/ui/category-tabs"
import { getCategoriesWithFallback, type CategoryData } from "@/lib/dynamic-categories"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  publishedAt: string
  views: number
  featured: boolean
  coverImage: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
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
      const [postsResponse, categoriesData] = await Promise.all([
        fetch("/api/admin/blogs").catch(() => ({ ok: false, json: () => Promise.resolve({ posts: [] }) })),
        getCategoriesWithFallback(),
      ])

      let postsData = { posts: [] }
      if (postsResponse.ok) {
        postsData = await postsResponse.json()
      }

      const publishedPosts = (postsData.posts || []).filter((post: BlogPost) => post.status === "published")
      setPosts(publishedPosts)
      setCategories(categoriesData.blogCategories)
    } catch (error) {
      console.error("Failed to load blog data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "all") return true
    return (
      post.category === selectedCategory || post.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === selectedCategory
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Blog
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4">
            Latest Stories & Insights
          </h1>
          <p className="text-xl text-gray-600 italic max-w-2xl mx-auto">
            Dive into the world of anime creation, behind-the-scenes content, and industry insights
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

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={post.coverImage || "/placeholder.svg?height=200&width=400&text=Blog+Post"}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">{post.views.toLocaleString()} views</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {selectedCategory === "all"
                ? "No blog posts are available at the moment."
                : `No posts found in the "${selectedCategory}" category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
