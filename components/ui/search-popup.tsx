"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  type: "blog" | "video" | "page"
  url: string
  excerpt?: string
  category?: string
}

export function SearchPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
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
      setResults([])
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
            setResults([])
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
    const mockResults: SearchResult[] = [
      {
        id: "1",
        title: "Latest Anime News and Updates",
        type: "blog",
        url: "/blog/anime-news-updates",
        excerpt: "Stay updated with the latest happenings in the anime world...",
        category: "News",
      },
      {
        id: "2",
        title: "Behind the Scenes: Animation Process",
        type: "video",
        url: "/watch/behind-scenes-animation",
        excerpt: "Discover how we create our animated content...",
        category: "Tutorial",
      },
      {
        id: "3",
        title: "About Flavor Studios",
        type: "page",
        url: "/about",
        excerpt: "Learn more about our studio and mission...",
      },
    ].filter(
      (result) =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setResults(mockResults)
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
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
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
  const handleResultClick = (result: SearchResult) => {
    addToRecentSearches(query)
    setIsOpen(false)
    window.location.href = result.url
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
        <DialogContent className="max-w-full h-full sm:h-auto p-0 gap-0 border-none bg-transparent">
          <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-start pt-[10vh] px-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="w-full max-w-2xl mx-auto">
              {/* Search input */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search blog posts, videos..."
                  className="pl-12 pr-4 py-4 text-lg border-2 focus-visible:ring-blue-600 bg-white"
                  aria-label="Search input"
                  aria-describedby="search-description"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search results */}
              <div ref={resultsRef} className="bg-white rounded-lg border shadow-lg max-h-96 overflow-y-auto">
                {query && results.length > 0 && (
                  <div className="p-2">
                    <div className="text-sm text-muted-foreground mb-2 px-2">
                      {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                    </div>
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-colors",
                          "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                          selectedIndex === index && "bg-blue-50",
                        )}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getTypeIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{result.title}</div>
                            {result.excerpt && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{result.excerpt}</div>
                            )}
                            {result.category && <div className="text-xs text-blue-600 mt-1">{result.category}</div>}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query && !isSearching && results.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <div>No results found for "{query}"</div>
                    <div className="text-sm mt-1">Try different keywords or check spelling</div>
                  </div>
                )}

                {!query && (
                  <div className="p-4 space-y-4">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4" />
                          <span>Recent searches</span>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              onClick={() => {
                                setQuery(search)
                                debouncedSearch(search)
                              }}
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Popular searches</span>
                      </div>
                      <div className="space-y-1">
                        {popularSearches.map((search, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            onClick={() => {
                              setQuery(search)
                              debouncedSearch(search)
                            }}
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyboard shortcuts */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-4">
                  <span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd> to navigate
                  </span>
                  <span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd> to select
                  </span>
                  <span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> to close
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
