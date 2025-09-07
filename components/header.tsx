"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Coffee } from "lucide-react"
import { MegaMenu, type MenuItem } from "./mega-menu"
import { MobileMegaMenu } from "./mobile-mega-menu"
import { SearchFeature } from "./ui/search-feature"
import type { Category } from "@/types/category" // <--- Unified type

// Helper: only include "All" if it's not present in the categories
function buildCategorySubItems(
  categories: Category[],
  allLabel: string,
  allSlug: string,
  basePath: string,
  allDescription: string,
  typeLabel: string
) {
  const mapped = (categories || []).map(category => ({
    label: category.name,
    href: `${basePath}?category=${category.slug}`,
    description:
      category.tooltip ??
      `${category.name} ${typeLabel}${category.postCount && category.postCount > 0 ? ` (${category.postCount})` : ""}`,
  }))

  const hasAll = categories.some(cat =>
    cat.slug.toLowerCase() === allSlug.toLowerCase()
  )

  return hasAll
    ? mapped
    : [{ label: allLabel, href: basePath, description: allDescription }, ...mapped]
}

export function Header({
  blogCategories = [],
  videoCategories = [],
}: {
  blogCategories?: Category[]
  videoCategories?: Category[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Use the DB slugs here so we don't get a double "All" if present
  const blogSubItems = buildCategorySubItems(
    blogCategories,
    "All Posts",
    "all-posts", // Use the actual slug present in your DB
    "/blog",
    "Browse all our blog content",
    "posts"
  )

  const videoSubItems = buildCategorySubItems(
    videoCategories,
    "All Videos",
    "all-videos", // Use the actual slug present in your DB
    "/watch",
    "Browse our complete video library",
    "videos"
  )

  const menuItems: MenuItem[] = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog", subItems: blogSubItems },
    { label: "Watch", href: "/watch", subItems: videoSubItems },
    { label: "Play", href: "/play" },
    {
      label: "About",
      subItems: [
        { label: "Our Story", href: "/about", description: "Learn about Flavor Studios" },
        { label: "Careers", href: "/career", description: "Join our creative team" },
        { label: "FAQ", href: "/faq", description: "Frequently asked questions" },
      ],
    },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Flavor Studios
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <MegaMenu items={menuItems} />
            <SearchFeature />
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
            <Button asChild className="bg-orange-700 hover:bg-orange-800 text-white">
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
