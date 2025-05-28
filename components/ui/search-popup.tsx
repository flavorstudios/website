"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  type: "blog" | "video" | "page"
  url: string
  excerpt?: string
  category?: string
}

interface BlogResult {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
}

interface VideoResult {
  id: string
  slug: string
  title: string
  views: number
  duration: string
  publishedAt: string
}

interface SearchResults {
  blogs: BlogResult[]
  videos: VideoResult[]
}

export function SearchPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResults>({ blogs: [], videos: [] })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Mock popular searches
  const popularSearches = ["Anime Reviews", "Behind the Scenes", "Tutorials", "Latest Episodes"]

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with '/' or Cmd/Ctrl + K
      if (
        (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) ||
        ((e.metaKey || e.ctrlKey) && e.key === "k")
      ) {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setQuery("")
      setSearchResult({ blogs: [], videos: [] })
      setSelectedIndex(-1)
    }
  }, [isOpen])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (searchQuery: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery)
          } else {
            setSearchResult({ blogs: [], videos: [] })
            setIsSearching(false)
          }
        }, 300)
      }
    })(),
    [],
  )

  // Mock search function
  const performSearch = async (searchQuery: string) => {
    setIsSearching(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock results
    const mockResults: SearchResults = {
      blogs: [
        {
          id: "1",
          slug: "anime-news-updates",
          title: "Latest Anime News and Updates",
          excerpt: "Stay updated with the latest happenings in the anime world...",
          category: "News",
          publishedAt: new Date().toISOString(),
        },
      ],
      videos: [
        {
          id: "2",
          slug: "behind-scenes-animation",
          title: "Behind the Scenes: Animation Process",
          views: 1000,
          duration: "5:00",
          publishedAt: new Date().toISOString(),
        },
      ],
    }

    setSearchResult(mockResults)
    setIsSearching(false)
    setSelectedIndex(-1)
  }

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Skip keyboard navigation on mobile devices
    if ("ontouchstart" in window) return
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, searchResult.blogs.length + searchResult.videos.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && searchResult.blogs[selectedIndex]) {
          handleResultClick(searchResult.blogs[selectedIndex])
        } else if (selectedIndex >= 0 && searchResult.videos[selectedIndex - searchResult.blogs.length]) {
          handleResultClick(searchResult.videos[selectedIndex - searchResult.blogs.length])
        } else if (query.trim()) {
          handleSearch(query)
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  // Handle result click
  const handleResultClick = (result: BlogResult | VideoResult) => {
    addToRecentSearches(query)
    setIsOpen(false)
    window.location.href = `/blog/${result.slug}`
  }

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery)
      setIsOpen(false)
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  // Add to recent searches
  const addToRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog":
        return "📝"
      case "video":
        return "🎥"
      case "page":
        return "📄"
      default:
        return "📄"
    }
  }

  const hasResults = searchResult.blogs.length > 0 || searchResult.videos.length > 0
  const showNoResults = query.trim() !== "" && !isSearching && !hasResults

  return (
    <>
      {/* Search trigger button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-sm font-medium transition-colors hover:text-blue-600"
        onClick={() => setIsOpen(true)}
        aria-label="Search (Press / or Cmd+K)"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Search modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-full max-h-full sm:max-w-2xl sm:max-h-[80vh] p-0 gap-0 border-none bg-transparent sm:bg-white sm:border sm:rounded-lg">
          <div className="fixed inset-0 sm:relative bg-background/95 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none flex flex-col">
            {/* Header with search input */}
            <div className="flex-shrink-0 border-b bg-white p-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  placeholder="Search blog posts, videos, or support content…"
                  value={query}
                  onChange={handleInputChange}
                  className="border-0 focus-visible:ring-0 text-base sm:text-lg flex-1"
                  autoComplete="off"
                />
                {isSearching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />}
              </div>
            </div>

            {/* Results area */}
            <div className="flex-1 overflow-y-auto bg-white">
              {/* Loading State */}
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Searching...</span>
                </div>
              )}

              {/* No Results */}
              {showNoResults && (
                <div className="text-center py-8 px-4">
                  <div className="text-muted-foreground mb-2">No results found for "{query}"</div>
                  <div className="text-sm text-muted-foreground">
                    Try searching for blog posts, videos, or support content
                  </div>
                </div>
              )}

              {/* Results */}
              {hasResults && !isSearching && (
                <div className="p-2">
                  {/* Blog Results */}
                  {searchResult.blogs.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Blog Posts
                      </div>
                      {searchResult.blogs.map((blog, index) => (
                        <Link
                          key={blog.id}
                          href={`/blog/${blog.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`block p-3 rounded-lg hover:bg-muted transition-colors touch-manipulation ${
                            selectedIndex === index ? "bg-muted" : ""
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">{blog.title}</div>
                          <div className="text-xs text-muted-foreground mb-1">
                            📝 {blog.category} • {new Date(blog.publishedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Video Results */}
                  {searchResult.videos.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Videos
                      </div>
                      {searchResult.videos.map((video, index) => (
                        <Link
                          key={video.id}
                          href={`/watch/${video.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`block p-3 rounded-lg hover:bg-muted transition-colors touch-manipulation ${
                            selectedIndex === (searchResult.blogs.length + index) ? "bg-muted" : ""
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">{video.title}</div>
                          <div className="text-xs text-muted-foreground">
                            🎥 {video.views.toLocaleString()} views • {video.duration} •{" "}
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              {!query.trim() && !isSearching && (
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
