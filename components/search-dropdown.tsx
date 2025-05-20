"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, FileText, Video, FolderOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { searchAll, type SearchResultItem } from "@/lib/search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SearchDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 200) // 200ms debounce as requested

  // Handle search
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchAll(debouncedQuery)
        setResults(searchResults)
        setSelectedIndex(-1) // Reset selection when results change
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            window.location.href = results[selectedIndex].url
            setIsOpen(false)
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, results, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  // Get icon based on result type
  const getResultIcon = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 mr-2 text-primary" />
      case "watch":
        return <Video className="h-4 w-4 mr-2 text-primary" />
      case "blog-category":
      case "watch-category":
        return <FolderOpen className="h-4 w-4 mr-2 text-primary" />
      default:
        return null
    }
  }

  // Get label based on result type
  const getResultTypeLabel = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "blog":
        return "Blog"
      case "watch":
        return "Video"
      case "blog-category":
        return "Blog Category"
      case "watch-category":
        return "Video Category"
      default:
        return ""
    }
  }

  // Client-side highlight function
  const highlightMatchClient = (text: string, query: string) => {
    if (!query || !text) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    if (!lowerText.includes(lowerQuery)) return text

    const parts = []
    let lastIndex = 0

    let index = lowerText.indexOf(lowerQuery)
    while (index !== -1) {
      // Add text before match
      if (index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, index)}</span>)
      }

      // Add highlighted match
      parts.push(
        <span key={`highlight-${index}`} className="bg-primary/20 text-primary font-medium rounded px-0.5">
          {text.substring(index, index + query.length)}
        </span>,
      )

      lastIndex = index + query.length
      index = lowerText.indexOf(lowerQuery, lastIndex)
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>)
    }

    return <>{parts}</>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Search"
        className="text-foreground hover:bg-primary/10 hover:text-primary"
      >
        <Search className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-screen max-w-md rounded-md border bg-background/95 backdrop-blur-md shadow-lg z-50 overflow-hidden transition-all duration-200 ease-in-out animate-in slide-in-from-top-5">
          <div className="p-4">
            <div className="flex items-center border rounded-md bg-background">
              <Search className="h-4 w-4 ml-3 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search Flavor Studios..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-poppins"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery("")}
                  className="h-8 w-8 mr-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className={cn("max-h-[60vh] overflow-y-auto", !results.length && !isLoading && !query && "hidden")}>
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2" ref={resultsRef}>
                {results.map((result, index) => (
                  <Link
                    key={`${result.url}-${index}`}
                    href={result.url}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 hover:bg-muted/50 transition-colors",
                      selectedIndex === index && "bg-muted/70",
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{highlightMatchClient(result.title, debouncedQuery)}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {highlightMatchClient(result.description, debouncedQuery)}
                        </div>
                        <div className="mt-1 text-xs inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {getResultTypeLabel(result.type)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-muted-foreground">No results found for "{query}"</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
