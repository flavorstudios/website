"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coffee, Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { CategoryDropdown } from "@/components/category-dropdown"
import { blogCategories } from "@/lib/blogCategories"
import { watchCategories } from "@/lib/watchCategories"
import { PopupSearch } from "@/components/popup-search"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const pathname = usePathname()

  // Handle scroll with error handling
  useEffect(() => {
    const handleScroll = () => {
      try {
        setIsScrolled(window.scrollY > 10)
      } catch (error) {
        console.error("Scroll handling error:", error)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setExpandedSection(null)
  }, [pathname])

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const isCategoryActive = (categoryUrl: string) => {
    return pathname === categoryUrl
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Left Navigation */}
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-105 mr-4">
            <span className="font-orbitron font-bold text-2xl md:text-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-primary bg-clip-text text-transparent">
              fl
            </span>
          </Link>

          {/* Desktop Left Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Button */}
            <Link href="/" className={cn("nav-link gradient-border", pathname === "/" && "text-primary font-medium")}>
              Home
            </Link>

            {/* Blog Dropdown */}
            <CategoryDropdown title="Blog" mainRoute="/blog" categories={blogCategories} baseUrl="/blog/category" />

            {/* Watch Dropdown */}
            <CategoryDropdown title="Watch" mainRoute="/watch" categories={watchCategories} baseUrl="/watch/category" />

            <Link
              href="/play"
              className={cn("nav-link gradient-border", pathname === "/play" && "text-primary font-medium")}
            >
              Play
            </Link>
          </nav>
        </div>

        {/* Centered Search - Desktop Only */}
        <div className="hidden md:flex justify-center max-w-md w-full mx-4">
          <PopupSearch />
        </div>

        {/* Right Navigation */}
        <div className="flex items-center">
          {/* Desktop Right Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/about"
              className={cn("nav-link gradient-border", pathname === "/about" && "text-primary font-medium")}
            >
              About
            </Link>

            <Link href="/support">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "flex items-center space-x-1 hover:bg-primary/10 hover:text-primary transition-all duration-200",
                  pathname === "/support" && "bg-primary/10 text-primary",
                )}
              >
                <Coffee className="h-4 w-4 mr-1" />
                <span>Buy Me A Coffee</span>
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </nav>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Search */}
            <div className="md:hidden">
              <PopupSearch />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              className="relative"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b shadow-md">
          <nav className="container mx-auto py-2">
            {/* Home Link */}
            <Link
              href="/"
              className={cn(
                "flex items-center px-4 py-3 mb-1 rounded-md transition-all",
                isActive("/") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Blog Section */}
            <div className="mb-1">
              <div className="flex items-center">
                <Link
                  href="/blog"
                  className={cn(
                    "flex-1 px-4 py-3 rounded-l-md transition-all",
                    isActive("/blog") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <button
                  onClick={() => toggleSection("blog")}
                  className={cn(
                    "p-3 rounded-r-md transition-all",
                    isActive("/blog") ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
                  )}
                  aria-label="Toggle Blog Categories"
                >
                  {expandedSection === "blog" ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>

              {expandedSection === "blog" && (
                <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-muted ml-6 mt-1">
                  {Object.entries(blogCategories).map(([slug, category]) => {
                    const categoryUrl = `/blog/category/${slug}`
                    return (
                      <Link
                        key={slug}
                        href={categoryUrl}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-all",
                          isCategoryActive(categoryUrl)
                            ? "text-primary font-medium bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.heading}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Watch Section */}
            <div className="mb-1">
              <div className="flex items-center">
                <Link
                  href="/watch"
                  className={cn(
                    "flex-1 px-4 py-3 rounded-l-md transition-all",
                    isActive("/watch") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Watch
                </Link>
                <button
                  onClick={() => toggleSection("watch")}
                  className={cn(
                    "p-3 rounded-r-md transition-all",
                    isActive("/watch") ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
                  )}
                  aria-label="Toggle Watch Categories"
                >
                  {expandedSection === "watch" ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>

              {expandedSection === "watch" && (
                <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-muted ml-6 mt-1">
                  {Object.entries(watchCategories).map(([slug, category]) => {
                    const categoryUrl = `/watch/category/${slug}`
                    return (
                      <Link
                        key={slug}
                        href={categoryUrl}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-all",
                          isCategoryActive(categoryUrl)
                            ? "text-primary font-medium bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.heading}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Play Link */}
            <Link
              href="/play"
              className={cn(
                "flex items-center px-4 py-3 mb-1 rounded-md transition-all",
                isActive("/play") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Play
            </Link>

            {/* About Link */}
            <Link
              href="/about"
              className={cn(
                "flex items-center px-4 py-3 mb-1 rounded-md transition-all",
                isActive("/about") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            {/* Buy Me A Coffee Link */}
            <Link
              href="/support"
              className={cn(
                "flex items-center px-4 py-3 mb-1 rounded-md transition-all",
                isActive("/support") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Coffee className="h-4 w-4 mr-2" />
              Buy Me A Coffee
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
