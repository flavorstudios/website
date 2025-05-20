"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Coffee, Menu, X, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { SearchDropdown } from "@/components/search-dropdown"
import { CategoryDropdown } from "@/components/category-dropdown"
import { blogCategories } from "@/lib/blogCategories"
import { watchCategories } from "@/lib/watchCategories"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-105">
          <span className="font-orbitron font-bold text-2xl md:text-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-primary bg-clip-text text-transparent">
            fL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Home Button */}
          <Link href="/" className="nav-link gradient-border flex items-center">
            <Home className="h-4 w-4 mr-1" />
            <span>Home</span>
          </Link>

          {/* Blog Dropdown */}
          <CategoryDropdown title="Blog" categories={blogCategories} baseUrl="/blog/category" />

          {/* Watch Dropdown */}
          <CategoryDropdown title="Watch" categories={watchCategories} baseUrl="/watch/category" />

          <Link href="/play" className="nav-link gradient-border">
            Play
          </Link>
          <Link href="/about" className="nav-link gradient-border">
            About
          </Link>
          <Link href="/support" className="ml-2">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center space-x-1 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <Coffee className="h-4 w-4 mr-1" />
              <span>Buy Me A Coffee</span>
            </Button>
          </Link>

          {/* Search Button */}
          <div className="ml-2">
            <SearchDropdown />
          </div>

          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Menu Button and Search */}
        <div className="flex items-center space-x-2 md:hidden">
          <SearchDropdown />
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

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link
              href="/"
              className="py-2 px-3 hover:bg-primary/10 rounded-md flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>

            {/* Blog Categories in Mobile Menu */}
            <div className="py-2 px-3">
              <div className="font-medium mb-1">Blog Categories</div>
              <div className="pl-2 space-y-2 mt-2">
                {Object.entries(blogCategories).map(([slug, category]) => (
                  <Link
                    key={slug}
                    href={`/blog/category/${slug}`}
                    className="block py-1 text-sm hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.heading}
                  </Link>
                ))}
              </div>
            </div>

            {/* Watch Categories in Mobile Menu */}
            <div className="py-2 px-3">
              <div className="font-medium mb-1">Watch Categories</div>
              <div className="pl-2 space-y-2 mt-2">
                {Object.entries(watchCategories).map(([slug, category]) => (
                  <Link
                    key={slug}
                    href={`/watch/category/${slug}`}
                    className="block py-1 text-sm hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.heading}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/play"
              className="py-2 px-3 hover:bg-primary/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Play
            </Link>
            <Link
              href="/about"
              className="py-2 px-3 hover:bg-primary/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/support"
              className="py-2 px-3 hover:bg-primary/10 rounded-md"
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
