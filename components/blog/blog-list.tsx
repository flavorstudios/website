"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock } from "lucide-react"
import { formatDate } from "@/lib/date" // <-- Added
import { normalizeSlug } from "@/lib/slugify"
import type { BlogPost } from "@/lib/content-store"

interface BlogListProps {
  posts?: BlogPost[]
  category?: string
  searchQuery?: string
}

export function BlogList({ posts = [], category = "all", searchQuery = "" }: BlogListProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts)

  useEffect(() => {
    let filtered = posts.filter((post) => post.status === "published")

    // Filter by category (now supports multi-category)
    if (category !== "all") {
      filtered = filtered.filter((post) =>
        Array.isArray(post.categories) && post.categories.length > 0
          ? post.categories.map((c) => c.toLowerCase()).includes(category.toLowerCase())
          : post.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredPosts(filtered)
  }, [posts, category, searchQuery])

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts found</h3>
        <p className="text-gray-500">
          {searchQuery ? "Try adjusting your search terms." : "Check back later for new content."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts.map((post) => {
        const authorLabel = typeof post.author === "string" ? post.author.trim() : "";

        return (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/blog/${normalizeSlug(post.slug)}`} className="block">
              <div className="relative h-48 bg-gray-200">
                {post.featuredImage ? (
                  <Image src={post.featuredImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">{post.title.charAt(0)}</span>
                  </div>
                )}
                {post.status !== "published" && (
                  <Badge className="absolute top-2 left-2" variant="destructive">
                    {post.status}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                  {authorLabel && (
                    <>
                      <User className="w-4 h-4 ml-2" />
                      <span>{authorLabel}</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>

              <div className="flex items-center justify-between flex-wrap gap-2">
                  {/* MULTI-CATEGORY BADGES */}
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(post.categories) && post.categories.length > 0
                      ? post.categories.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))
                      : (
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime || "5 min read"}</span>
                  </div>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        );
      })}
    </div>
  )
}
