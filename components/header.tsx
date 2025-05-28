"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Coffee } from "lucide-react"
import { MegaMenu, type MenuItem } from "./mega-menu"
import { MobileMegaMenu } from "./mobile-mega-menu"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems: MenuItem[] = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Blog",
      subItems: [
        {
          label: "Anime News",
          href: "/blog/category/anime-news",
          description: "Latest updates from the anime world",
        },
        {
          label: "Reviews",
          href: "/blog/category/reviews",
          description: "In-depth anime and manga reviews",
        },
        {
          label: "Behind the Scenes",
          href: "/blog/category/behind-the-scenes",
          description: "Studio insights and processes",
        },
        {
          label: "All Posts",
          href: "/blog",
          description: "Browse all our blog content",
        },
      ],
    },
    {
      label: "Watch",
      subItems: [
        {
          label: "Originals",
          href: "/watch/originals",
          description: "Our exclusive original series",
        },
        {
          label: "Episodes",
          href: "/watch/episodes",
          description: "Latest episode releases",
        },
        {
          label: "All Videos",
          href: "/watch",
          description: "Browse our complete video library",
        },
      ],
    },
    {
      label: "Play",
      href: "/play",
    },
    {
      label: "About",
      subItems: [
        {
          label: "Our Story",
          href: "/about",
          description: "Learn about Flavor Studios",
        },
        {
          label: "Team",
          href: "/about/team",
          description: "Meet our talented creators",
        },
        {
          label: "Careers",
          href: "/career",
          description: "Join our creative team",
        },
      ],
    },
    {
      label: "Contact",
      href: "/contact",
    },
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

            <button
              className="text-sm font-medium transition-colors hover:text-blue-600"
              onClick={() => {
                // Search functionality will be added later
                console.log("Search clicked")
              }}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="mt-8">
                <MobileMegaMenu items={menuItems} onItemClick={() => setIsOpen(false)} />

                <div className="mt-6 pt-6 border-t">
                  <button
                    className="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-blue-600 w-full p-3"
                    onClick={() => {
                      console.log("Search clicked")
                      setIsOpen(false)
                    }}
                  >
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </button>
                </div>
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
