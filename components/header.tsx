"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Coffee } from "lucide-react"
import { MegaMenu, type MenuItem } from "./mega-menu"
import { MobileMegaMenu } from "./mobile-mega-menu"
import { SearchFeature } from "./ui/search-feature"

// Short Labels & Descriptions for concise menu
const BLOG_LABELS: Record<string, string> = {
  "anime-news": "Anime News",
  "reviews": "Reviews",
  "guides": "Guides",
  "features": "Features",
  "explainers": "Explained",
  "community": "Community",
  "merch": "Merch",
  "opinion": "Opinion",
}
const BLOG_DESCRIPTIONS: Record<string, string> = {
  "anime-news": "Anime News posts and articles",
  "reviews": "Reviews posts and articles",
  "guides": "Guides, watch orders & tutorials",
  "features": "Editorials, Top 10s, Interviews",
  "explainers": "In-depth explainers & analysis",
  "community": "Culture, Cosplay, Events",
  "merch": "Figures, collectibles & merch",
  "opinion": "Staff picks & essays",
}

const WATCH_LABELS: Record<string, string> = {
  "original-series": "Originals",
  "shorts": "Shorts",
  "movies": "Movies",
  "trailers": "Trailers",
  "behind-the-scenes": "Behind the Scenes",
}
const WATCH_DESCRIPTIONS: Record<string, string> = {
  "original-series": "Original anime series",
  "shorts": "Anime shorts & clips",
  "movies": "Full-length anime movies",
  "trailers": "Latest anime trailers",
  "behind-the-scenes": "BTS & production stories",
}

const BLOG_LIMIT = 6
const WATCH_LIMIT = 6

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const response = await fetch("/api/admin/categories")
        const data = await response.json()
        const blogCategories = data.categories?.blog || []
        const watchCategories = data.categories?.watch || []

        // Blog Menu
        const mappedBlog = blogCategories
          .filter((category: any) => BLOG_LABELS[category.slug])
          .map((category: any) => ({
            label: BLOG_LABELS[category.slug] || category.title || category.name,
            href: `/blog?category=${category.slug}`,
            tooltip: BLOG_DESCRIPTIONS[category.slug] || category.meta?.description || "",
            description: BLOG_DESCRIPTIONS[category.slug] || category.meta?.description || "",
          }))

        const blogMenuItems = [
          {
            label: "All Posts",
            href: "/blog",
            description: "Browse all our blog content",
            tooltip: "Browse all our blog content",
          },
          ...mappedBlog.slice(0, BLOG_LIMIT),
          ...(mappedBlog.length > BLOG_LIMIT
            ? [
                {
                  label: "All Categories",
                  href: "/blog/categories",
                  description: "Browse all blog categories",
                  tooltip: "Browse all blog categories",
                },
              ]
            : []),
        ]

        // Watch Menu (use correct slugs!)
        const mappedWatch = watchCategories
          .filter((category: any) => WATCH_LABELS[category.slug])
          .map((category: any) => ({
            label: WATCH_LABELS[category.slug] || category.title || category.name,
            href: `/watch?category=${category.slug}`,
            tooltip: WATCH_DESCRIPTIONS[category.slug] || category.meta?.description || "",
            description: WATCH_DESCRIPTIONS[category.slug] || category.meta?.description || "",
          }))

        const watchMenuItems = [
          {
            label: "All Videos",
            href: "/watch",
            description: "Browse our complete video library",
            tooltip: "Browse our complete video library",
          },
          ...mappedWatch.slice(0, WATCH_LIMIT),
          ...(mappedWatch.length > WATCH_LIMIT
            ? [
                {
                  label: "All Categories",
                  href: "/watch/categories",
                  description: "Browse all video categories",
                  tooltip: "Browse all video categories",
                },
              ]
            : []),
        ]

        const dynamicMenuItems: MenuItem[] = [
          { label: "Home", href: "/" },
          {
            label: "Blog",
            subItems: blogMenuItems,
          },
          {
            label: "Watch",
            subItems: watchMenuItems,
          },
          { label: "Play", href: "/play" },
          {
            label: "About",
            subItems: [
              {
                label: "Our Story",
                href: "/about",
                description: "Learn about Flavor Studios",
              },
              {
                label: "Careers",
                href: "/career",
                description: "Join our creative team",
              },
              {
                label: "FAQ",
                href: "/faq",
                description: "Frequently asked questions",
              },
            ],
          },
          { label: "Contact", href: "/contact" },
        ]

        setMenuItems(dynamicMenuItems)
      } catch (error) {
        console.error("Failed to load dynamic menu items:", error)
      }
    }

    loadMenuItems()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Flavor Studios
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <MegaMenu
              items={menuItems}
              dropdownProps={{
                className:
                  "max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 relative",
                itemClassName: "relative group font-bold",
                tooltip: true,
                fade: true,
              }}
            />
            <div className="flex items-center gap-2">
              <SearchFeature />
            </div>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center md:hidden">
              <SearchFeature />
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            </div>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="mt-8">
                <MobileMegaMenu items={menuItems} onItemClick={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/support">
                <Coffee className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}