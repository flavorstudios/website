"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Coffee, Menu, X, FileText, Video, FolderOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { CategoryDropdown } from "@/components/category-dropdown"
import { blogCategories } from "@/lib/blogCategories"
import { watchCategories } from "@/lib/watchCategories"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { searchAll, type SearchResultItem } from "@/lib/search"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Search state
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const debouncedSearchQuery = useDebounce(searchQuery, 200)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchAll(debouncedSearchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    fetchResults()
  }, [debouncedSearchQuery])

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchFocused(false)
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault()
      const selectedResult = searchResults[selectedResultIndex]
      if (selectedResult) {
        window.location.href = selectedResult.url
      }
    }
  }

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Left Side Navigation */}
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-105 mr-4">
            <span className="font-orbitron font-bold text-2xl md:text-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-primary bg-clip-text text-transparent">
              fL
            </span>
          </Link>

          {/* Desktop Left Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Link - Removed the icon */}
            <Link href="/" className={cn("nav-link gradient-border", pathname === "/" && "text-primary")}>
              Home
            </Link>

            {/* Blog Dropdown with main route */}
            <CategoryDropdown title="Blog" mainRoute="/blog" categories={blogCategories} baseUrl="/blog/category" />

            {/* Watch Dropdown with main route */}
            <CategoryDropdown title="Watch" mainRoute="/watch" categories={watchCategories} baseUrl="/watch/category" />

            <Link href="/play" className={cn("nav-link gradient-border", pathname === "/play" && "text-primary")}>
              Play
            </Link>

            <Link href="/about" className={cn("nav-link gradient-border", pathname === "/about" && "text-primary")}>
              About
            </Link>
          </nav>
        </div>

        {/* Centered Search Bar - Desktop Only */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4 relative"
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search Flavor Studios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                "pl-10 pr-4 py-2 w-full bg-background/50 border-muted",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                "rounded-full font-poppins text-sm",
              )}
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && (searchQuery.trim() !== "" || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-[60vh] overflow-y-auto rounded-md border bg-background/95 backdrop-blur-md shadow-lg z-50">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-pulse">Searching...</div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <Link
                      key={`${result.url}-${index}`}
                      href={result.url}
                      onClick={() => {
                        setIsSearchFocused(false)
                        setSearchQuery("")
                      }}
                      className={cn(
                        "block px-4 py-3 hover:bg-muted/50 transition-colors",
                        selectedResultIndex === index && "bg-muted/70",
                      )}
                      onMouseEnter={() => setSelectedResultIndex(index)}
                    >
                      <div className="flex items-start">
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{result.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{result.description}</div>
                          <div className="mt-1 text-xs inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {getResultTypeLabel(result.type)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No results found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center">
          {/* Desktop Right Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {/* Updated Support Link with Tooltip and Animation */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/support">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "flex items-center space-x-1 hover:bg-primary/10 hover:text-primary transition-all duration-200",
                        "support-button",
                        pathname === "/support" && "bg-primary/10 text-primary",
                      )}
                    >
                      <Coffee className="h-4 w-4 mr-1 animate-bounce-subtle" />
                      <span>Support</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="font-medium">
                  Buy Me a Coffee
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Removed the standalone search icon */}

            <div className="ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Button and Search */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Removed the mobile search icon */}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            {/* Removed the Home icon from mobile menu */}
            <Link
              href="/"
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md",
                pathname === "/" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Blog Main Link in Mobile Menu */}
            <Link
              href="/blog"
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md font-medium",
                pathname === "/blog" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>

            {/* Blog Categories in Mobile Menu */}
            <div className="py-2 px-3 pl-6">
              <div className="font-medium mb-1 text-sm text-muted-foreground">Blog Categories</div>
              <div className="space-y-2 mt-2">
                {Object.entries(blogCategories).map(([slug, category]) => {
                  const categoryUrl = `/blog/category/${slug}`
                  return (
                    <Link
                      key={slug}
                      href={categoryUrl}
                      className={cn(
                        "block py-1 text-sm hover:text-primary",
                        pathname === categoryUrl && "text-primary",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.heading}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Watch Main Link in Mobile Menu */}
            <Link
              href="/watch"
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md font-medium",
                pathname === "/watch" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Watch
            </Link>

            {/* Watch Categories in Mobile Menu */}
            <div className="py-2 px-3 pl-6">
              <div className="font-medium mb-1 text-sm text-muted-foreground">Watch Categories</div>
              <div className="space-y-2 mt-2">
                {Object.entries(watchCategories).map(([slug, category]) => {
                  const categoryUrl = `/watch/category/${slug}`
                  return (
                    <Link
                      key={slug}
                      href={categoryUrl}
                      className={cn(
                        "block py-1 text-sm hover:text-primary",
                        pathname === categoryUrl && "text-primary",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.heading}
                    </Link>
                  )
                })}
              </div>
            </div>

            <Link
              href="/play"
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md",
                pathname === "/play" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Play
            </Link>

            <Link
              href="/about"
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md",
                pathname === "/about" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            {/* Updated Support Link in Mobile Menu */}
            <Link
              href="/support"
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md",
                pathname === "/support" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <Coffee className="h-4 w-4 mr-2" />
                Support
              </span>
            </Link>
          </nav>
        </div>
      )}

      {/* Add the animation styles */}
      <style jsx global>{`
        .support-button {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .support-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        .support-button:hover .animate-bounce-subtle {
          animation: bounce-subtle 1s ease infinite;
        }
      `}</style>
    </header>
  )
}
