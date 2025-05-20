"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coffee, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { SearchDropdown } from "@/components/search-dropdown"
import { CenteredSearch } from "@/components/centered-search"
import { CategoryDropdown } from "@/components/category-dropdown"
import { blogCategories } from "@/lib/blogCategories"
import { watchCategories } from "@/lib/watchCategories"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            {/* Home Button - Removed icon */}
            <Link href="/" className={cn("nav-link gradient-border", pathname === "/" && "text-primary")}>
              Home
            </Link>

            {/* Blog Dropdown */}
            <CategoryDropdown title="Blog" mainRoute="/blog" categories={blogCategories} baseUrl="/blog/category" />

            {/* Watch Dropdown */}
            <CategoryDropdown title="Watch" mainRoute="/watch" categories={watchCategories} baseUrl="/watch/category" />

            <Link href="/play" className={cn("nav-link gradient-border", pathname === "/play" && "text-primary")}>
              Play
            </Link>
          </nav>
        </div>

        {/* Centered Search - Desktop Only */}
        <div className="hidden md:block max-w-md w-full mx-4">
          <CenteredSearch />
        </div>

        {/* Right Navigation */}
        <div className="flex items-center">
          {/* Desktop Right Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/about" className={cn("nav-link gradient-border", pathname === "/about" && "text-primary")}>
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
            <SearchDropdown />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
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
            {/* Home Link - Removed icon */}
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

            {/* Blog Link and Categories in Mobile Menu */}
            <div className="py-2 px-3">
              <Link
                href="/blog"
                className={cn("font-medium block mb-2 hover:text-primary", pathname === "/blog" && "text-primary")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <div className="pl-2 space-y-2 mt-2">
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

            {/* Watch Link and Categories in Mobile Menu */}
            <div className="py-2 px-3">
              <Link
                href="/watch"
                className={cn("font-medium block mb-2 hover:text-primary", pathname === "/watch" && "text-primary")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Watch
              </Link>
              <div className="pl-2 space-y-2 mt-2">
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
                Buy Me A Coffee
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
