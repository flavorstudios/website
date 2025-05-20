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
import { usePathname } from "next/navigation"

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
        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-105">
          <span className="font-orbitron font-bold text-2xl md:text-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-primary bg-clip-text text-transparent">
            fL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Home Button */}
          <Link
            href="/"
            className={cn("nav-link gradient-border flex items-center", pathname === "/" && "text-primary")}
          >
            <Home className="h-4 w-4 mr-1" />
            <span>Home</span>
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

          <Link href="/support" className="ml-2">
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
              className={cn(
                "py-2 px-3 hover:bg-primary/10 rounded-md flex items-center",
                pathname === "/" && "bg-primary/5 text-primary",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4 mr-2" />
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
