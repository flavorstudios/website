"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coffee, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { PopupSearch } from "@/components/popup-search"
import { MegaMenuDropdown } from "@/components/mega-menu-dropdown"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const pathname = usePathname()

  // Blog categories for mega menu
  const blogCategories = [
    { name: "Anime Reviews", href: "/blog/category/anime-reviews", description: "In-depth anime analysis" },
    { name: "Industry News", href: "/blog/category/industry-news", description: "Latest anime industry updates" },
    { name: "Storytelling Tips", href: "/blog/category/storytelling-tips", description: "Creative writing guides" },
    { name: "Behind the Scenes", href: "/blog/category/behind-the-scenes", description: "Studio insights" },
  ]

  // Watch categories for mega menu
  const watchCategories = [
    { name: "Original Series", href: "/watch/category/original-series", description: "Our flagship content" },
    { name: "Short Films", href: "/watch/category/short-films", description: "Bite-sized stories" },
    { name: "Trailers", href: "/watch/category/trailers", description: "Upcoming releases" },
    { name: "Recommendations", href: "/watch/category/recommendations", description: "Curated picks" },
  ]

  // Mobile categories for accordion
  const mobileBlogCategories = {
    "anime-reviews": { heading: "Anime Reviews" },
    "industry-news": { heading: "Industry News" },
    "storytelling-tips": { heading: "Storytelling Tips" },
    "behind-the-scenes": { heading: "Behind the Scenes" },
  }

  const mobileWatchCategories = {
    "original-series": { heading: "Original Series" },
    "short-films": { heading: "Short Films" },
    trailers: { heading: "Trailers" },
    recommendations: { heading: "Recommendations" },
  }

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
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Left Navigation */}
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-all duration-300 hover:scale-105 mr-6 md:mr-8">
            <span className="font-orbitron font-bold text-2xl md:text-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-primary bg-clip-text text-transparent">
              fl
            </span>
          </Link>

          {/* Desktop Left Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Button */}
            <Link
              href="/"
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-primary/8 hover:text-primary",
                pathname === "/" &&
                  "text-primary bg-primary/10 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full",
              )}
            >
              Home
            </Link>

            {/* Blog Mega Menu */}
            <MegaMenuDropdown title="Blog" menuTitle="Explore Our Blog" mainRoute="/blog" categories={blogCategories} />

            {/* Watch Mega Menu */}
            <MegaMenuDropdown
              title="Watch"
              menuTitle="Watch by Category"
              mainRoute="/watch"
              categories={watchCategories}
            />

            <Link
              href="/play"
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-primary/8 hover:text-primary",
                pathname === "/play" &&
                  "text-primary bg-primary/10 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full",
              )}
            >
              Play
            </Link>
          </nav>
        </div>

        {/* Centered Search - Desktop Only - UNCHANGED */}
        <div className="hidden md:flex justify-center max-w-md w-full mx-6">
          <PopupSearch />
        </div>

        {/* Right Navigation */}
        <div className="flex items-center">
          {/* Desktop Right Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            <Link
              href="/about"
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-primary/8 hover:text-primary",
                pathname === "/about" &&
                  "text-primary bg-primary/10 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full",
              )}
            >
              About
            </Link>

            <Link href="/support">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "flex items-center space-x-2 h-10 px-4 text-sm font-medium tracking-wide border-border/50 hover:bg-primary/8 hover:text-primary hover:border-primary/30 transition-all duration-300",
                  pathname === "/support" && "bg-primary/10 text-primary border-primary/30",
                )}
              >
                <Coffee className="h-4 w-4" />
                <span>Buy Me A Coffee</span>
              </Button>
            </Link>

            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Controls - UNCHANGED */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Mobile Search - UNCHANGED */}
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
              className="relative h-10 w-10 hover:bg-primary/8 transition-all duration-300"
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-2",
                  )}
                />
                <span
                  className={cn(
                    "absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-2",
                  )}
                />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-out",
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="bg-background/98 backdrop-blur-xl border-b border-border/30 shadow-xl">
          <nav className="container mx-auto py-4 space-y-1">
            {/* Home Link */}
            <Link
              href="/"
              className={cn(
                "flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300",
                isActive("/")
                  ? "bg-primary/15 text-primary border-l-4 border-primary"
                  : "hover:bg-muted/50 hover:translate-x-1",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Blog Section */}
            <div className="mx-2">
              <div className="flex items-center rounded-xl overflow-hidden">
                <Link
                  href="/blog"
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300",
                    isActive("/blog") ? "bg-primary/15 text-primary border-l-4 border-primary" : "hover:bg-muted/50",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <button
                  onClick={() => toggleSection("blog")}
                  className={cn(
                    "p-3 transition-all duration-300 hover:bg-muted/50",
                    isActive("/blog") ? "text-primary" : "",
                  )}
                  aria-label="Toggle Blog Categories"
                >
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      expandedSection === "blog" ? "rotate-180" : "",
                    )}
                  />
                </button>
              </div>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-500 ease-out",
                  expandedSection === "blog" ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0",
                )}
              >
                <div className="pl-6 pr-2 space-y-1 border-l-2 border-primary/20 ml-4">
                  {Object.entries(mobileBlogCategories).map(([slug, category]) => {
                    const categoryUrl = `/blog/category/${slug}`
                    return (
                      <Link
                        key={slug}
                        href={categoryUrl}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm transition-all duration-300",
                          isCategoryActive(categoryUrl)
                            ? "text-primary font-medium bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:translate-x-1",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.heading}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Watch Section */}
            <div className="mx-2">
              <div className="flex items-center rounded-xl overflow-hidden">
                <Link
                  href="/watch"
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300",
                    isActive("/watch") ? "bg-primary/15 text-primary border-l-4 border-primary" : "hover:bg-muted/50",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Watch
                </Link>
                <button
                  onClick={() => toggleSection("watch")}
                  className={cn(
                    "p-3 transition-all duration-300 hover:bg-muted/50",
                    isActive("/watch") ? "text-primary" : "",
                  )}
                  aria-label="Toggle Watch Categories"
                >
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      expandedSection === "watch" ? "rotate-180" : "",
                    )}
                  />
                </button>
              </div>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-500 ease-out",
                  expandedSection === "watch" ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0",
                )}
              >
                <div className="pl-6 pr-2 space-y-1 border-l-2 border-primary/20 ml-4">
                  {Object.entries(mobileWatchCategories).map(([slug, category]) => {
                    const categoryUrl = `/watch/category/${slug}`
                    return (
                      <Link
                        key={slug}
                        href={categoryUrl}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm transition-all duration-300",
                          isCategoryActive(categoryUrl)
                            ? "text-primary font-medium bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:translate-x-1",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.heading}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Play Link */}
            <Link
              href="/play"
              className={cn(
                "flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300",
                isActive("/play")
                  ? "bg-primary/15 text-primary border-l-4 border-primary"
                  : "hover:bg-muted/50 hover:translate-x-1",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Play
            </Link>

            {/* About Link */}
            <Link
              href="/about"
              className={cn(
                "flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300",
                isActive("/about")
                  ? "bg-primary/15 text-primary border-l-4 border-primary"
                  : "hover:bg-muted/50 hover:translate-x-1",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            {/* Buy Me A Coffee Link */}
            <Link
              href="/support"
              className={cn(
                "flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300",
                isActive("/support")
                  ? "bg-primary/15 text-primary border-l-4 border-primary"
                  : "hover:bg-muted/50 hover:translate-x-1",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Coffee className="h-4 w-4 mr-3" />
              Buy Me A Coffee
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
