"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Coffee } from "lucide-react"
import { MegaMenu, type MenuItem } from "./mega-menu"
import { MobileMegaMenu } from "./mobile-mega-menu"
import { SearchFeature } from "./ui/search-feature"

interface Category {
  name: string
  slug: string
  count: number
  tooltip?: string
  type?: string
}

// Helper: always include "All" menu entry, build description consistently
function buildCategorySubItems(
  categories: Category[],
  allLabel: string,
  allSlug: string,
  basePath: string,
  allDescription: string,
  typeLabel: string
) {
  // Always add "All ..." link as first subItem
  const subItems = [
    {
      label: allLabel,
      href: basePath,
      description: allDescription,
    },
    ...(categories || []).map(category => ({
      label: category.name,
      href: `${basePath}?category=${category.slug}`,
      description: category.tooltip ??
        `${category.name} ${typeLabel}${category.count > 0 ? ` (${category.count})` : ""}`,
    }))
  ]
  return subItems
}

export function Header({
  blogCategories = [],
  videoCategories = [],
}: {
  blogCategories?: Category[]
  videoCategories?: Category[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Build menu with defensive fallbacks (always array, never undefined)
  const blogSubItems = buildCategorySubItems(
    blogCategories,
    "All Posts",
    "all",
    "/blog",
    "Browse all our blog content",
    "posts"
  )

  const videoSubItems = buildCategorySubItems(
    videoCategories,
    "All Videos",
    "all",
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
