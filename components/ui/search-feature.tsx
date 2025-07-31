"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import { Badge } from "@/components/ui/badge" // Added for multi-category support
import { formatDate } from "@/lib/date" // <-- Added

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  categories?: string[]
  excerpt: string
  publishedAt: string
}

interface Video {
  id: string
  title: string
  slug: string
  views: number
  duration: string
  publishedAt: string
}

interface SearchResults {
  blogs: BlogPost[]
  videos: Video[]
}

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Highlight search terms in text
function highlightText(text: string, searchTerm: string) {
  if (!searchTerm.trim()) return text
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-blue-100 text-blue-900 rounded px-1">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function SearchFeature() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResults>({ blogs: [], videos: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults({ blogs: [], videos: [] })
      return
    }
    setIsLoading(true)
    try {
      const [blogsResponse, videosResponse] = await Promise.allSettled([
        fetch("/api/blogs"),
        fetch("/api/videos"),
      ])
      let blogs: BlogPost[] = []
      let videos: Video[] = []

      // Process blogs
      if (blogsResponse.status === "fulfilled" && blogsResponse.value.ok) {
        const blogsData = await blogsResponse.value.json()
        blogs = blogsData
          .filter((blog: BlogPost) => {
            // Multi-category match logic
            const search = query.toLowerCase()
            const title = blog.title.toLowerCase()
            const slug = blog.slug.toLowerCase()
            const excerpt = blog.excerpt.toLowerCase()
            // Multi or single category match
            const categories = Array.isArray(blog.categories) && blog.categories.length
              ? blog.categories.map((c) => c.toLowerCase())
              : [blog.category?.toLowerCase()]
            return (
              title.includes(search) ||
              slug.includes(search) ||
              excerpt.includes(search) ||
              categories.some((cat) => cat.includes(search))
            )
          })
          .slice(0, 5)
      }
      // Process videos
      if (videosResponse.status === "fulfilled" && videosResponse.value.ok) {
        const videosData = await videosResponse.value.json()
        videos = videosData
          .filter(
            (video: Video) =>
              video.title.toLowerCase().includes(query.toLowerCase()) ||
              video.slug.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 5)
      }
      setResults({ blogs, videos })
    } catch (error) {
      console.error("Search error:", error)
      setResults({ blogs: [], videos: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect for debounced search
  useEffect(() => {
    performSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, performSearch])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === "/" && !isOpen) {
        const activeElement = document.activeElement
        if (activeElement?.tagName !== "INPUT" && activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault()
          setIsOpen(true)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Handle modal keyboard navigation
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if ("ontouchstart" in window) return
    const totalResults = results.blogs.length + results.videos.length
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalResults)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev <= 0 ? totalResults - 1 : prev - 1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const allResults = [...results.blogs, ...results.videos]
      const selectedResult = allResults[selectedIndex]
      if (selectedResult) {
        const href = "category" in selectedResult ? `/blog/${selectedResult.slug}` : `/watch/${selectedResult.slug}`
        window.location.href = href
        setIsOpen(false)
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      setResults({ blogs: [], videos: [] })
      setSelectedIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const allResults = [...results.blogs, ...results.videos]
  const hasResults = allResults.length > 0
  const showNoResults = debouncedSearchQuery.trim() && !isLoading && !hasResults

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium transition-colors hover:text-blue-600"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Search Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-full max-h-full sm:max-w-2xl p-0 gap-0 border-none bg-transparent sm:bg-white sm:border sm:rounded-lg"
          onKeyDown={handleModalKeyDown}
        >
          <div className="fixed inset-0 sm:relative bg-background/95 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none flex flex-col">
            <div className="flex-shrink-0 border-b bg-white p-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  placeholder="Search blog posts, videos, or support content…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-base sm:text-lg flex-1 w-full"
                  autoComplete="off"
                />
                {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Searching...</span>
                </div>
              )}

              {/* No Results */}
              {showNoResults && (
                <div className="text-center py-8 px-4">
                  <div className="text-muted-foreground mb-2">
                    {`No results found for "${debouncedSearchQuery}"`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Try searching for blog posts, videos, or support content
                  </div>
                </div>
              )}

              {/* Results */}
              {hasResults && !isLoading && (
                <div className="p-2">
                  {/* Blog Results */}
                  {results.blogs.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Blog Posts
                      </div>
                      {results.blogs.map((blog, index) => (
                        <Link
                          key={blog.id}
                          href={`/blog/${blog.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`block p-3 rounded-lg hover:bg-muted transition-colors touch-manipulation ${
                            selectedIndex === index ? "bg-muted" : ""
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">
                            {highlightText(blog.title, debouncedSearchQuery)}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {Array.isArray(blog.categories) && blog.categories.length > 0 ? (
                              blog.categories.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xxs">
                                  {cat}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xxs">
                                {blog.category}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDate(blog.publishedAt)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {highlightText(blog.excerpt, debouncedSearchQuery)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Video Results */}
                  {results.videos.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Videos
                      </div>
                      {results.videos.map((video, index) => (
                        <Link
                          key={video.id}
                          href={`/watch/${video.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`block p-3 rounded-lg hover:bg-muted transition-colors touch-manipulation ${
                            selectedIndex === (results.blogs.length + index) ? "bg-muted" : ""
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">
                            {highlightText(video.title, debouncedSearchQuery)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            🎥 {video.views.toLocaleString()} views • {video.duration} •{" "}
                            {formatDate(video.publishedAt)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              {!debouncedSearchQuery.trim() && !isLoading && (
                <div className="p-4 border-t bg-muted/30">
                  <div className="text-xs text-muted-foreground text-center">
                    <div className="hidden sm:block">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd> to navigate •{" "}
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to select •{" "}
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> to close
                    </div>
                    <div className="sm:hidden">Tap to select • Swipe down to close</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
