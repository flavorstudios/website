"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Coffee } from "lucide-react"
import { MegaMenu, type MenuItem } from "./mega-menu"
import { MobileMegaMenu } from "./mobile-mega-menu"
import { SearchFeature } from "./ui/search-feature"
import { getCategoriesWithFallback } from "@/lib/dynamic-categories"

// No scroll limit or scroll styles, dropdown always fits content

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Watch", href: "/watch" },
    { label: "Play", href: "/play" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ])

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        // Use fallback method for dynamic categories (if you have API, you can replace here)
        const { blogCategories = [], videoCategories = [] } = await getCategoriesWithFallback()

        const blogMenuItems = [
          {
            label: "All Posts",
            href: "/blog",
            description: "Browse all our blog content",
          },
          ...blogCategories.slice(0, 6).map((category) => ({
            label: category.name,
            href: `/blog?category=${category.slug}`,
            description: `${category.name} posts and articles${category.count > 0 ? ` (${category.count})` : ""}`,
          })),
        ]

        const watchMenuItems = [
          {
            label: "All Videos",
            href: "/watch",
            description: "Browse our complete video library",
          },
          ...videoCategories.slice(0, 6).map((category) => ({
            label: category.name,
            href: `/watch?category=${category.slug}`,
            description: `${category.name} videos and content${category.count > 0 ? ` (${category.count})` : ""}`,
          })),
        ]

        const dynamicMenuItems: MenuItem[] = [
          { label: "Home", href: "/" },
          {
            label: "Blog",
            href: "/blog",
            subItems: blogMenuItems,
          },
          {
            label: "Watch",
            href: "/watch",
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
                tooltip: "Learn about Flavor Studios",
              },
              {
                label: "Careers",
                href: "/career",
                description: "Join our creative team",
                tooltip: "Join our creative team",
              },
              {
                label: "FAQ",
                href: "/faq",
                description: "Frequently asked questions",
                tooltip: "Frequently asked questions",
              },
            ],
          },
          { label: "Contact", href: "/contact" },
        ]

        setMenuItems(dynamicMenuItems)
      } catch (error) {
        console.error("Failed to load dynamic menu items:", error)
        // Fallback menuItems remain
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
                className: "relative", // No scroll or max-height
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