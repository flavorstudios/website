"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coffee, Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { CenteredSearch } from "@/components/centered-search"
import { CategoryDropdown } from "@/components/category-dropdown"
import { blogCategories } from "@/lib/blogCategories"
import { watchCategories } from "@/lib/watchCategories"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

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
              fL
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
        <div className="hidden md:block max-w-md w-full mx-4">
          <CenteredSearch onResultClick={() => {}} />
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
            {/* Mobile Search Icon */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                aria-label="Search"
                className="text-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Search Overlay */}
              {showMobileSearch && (
                <div
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowMobileSearch(false)
                    }
                  }}
                >
                  <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <CenteredSearch onResultClick={() => setShowMobileSearch(false)} />
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b shadow-md">
          <nav className="container mx-auto py-4">
            <Link
              href="/"
              className="block px-4 py-2 hover:bg-muted/50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 hover:bg-muted/50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
