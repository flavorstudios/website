"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Menu, Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MegaMenu, type MenuItem } from "@/components/mega-menu"
import { MobileMegaMenu } from "@/components/mobile-mega-menu"
import { SearchFeature } from "@/components/ui/search-feature"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Category } from "@/types/category"
import { cn } from "@/lib/utils"

function buildCategorySubItems(
  categories: Category[],
  allLabel: string,
  allSlug: string,
  basePath: string,
  allDescription: string,
  typeLabel: string,
) {
  const mapped = (categories || []).map((category) => ({
    label: category.name,
    href: `${basePath}?category=${category.slug}`,
    description:
      category.tooltip ||
      `${category.name} ${typeLabel}${
        category.postCount && category.postCount > 0 ? ` (${category.postCount})` : ""
      }`,
  }))

  const hasAll = categories.some(
    (category) => category.slug.toLowerCase() === allSlug.toLowerCase(),
  )

  return hasAll
    ? mapped
    : [{ label: allLabel, href: basePath, description: allDescription }, ...mapped]
}

interface HomeNavigationProps {
  blogCategories: Category[]
  videoCategories: Category[]
}

export function HomeNavigation({ blogCategories, videoCategories }: HomeNavigationProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const menuItems = useMemo<MenuItem[]>(() => {
    const blogSubItems = buildCategorySubItems(
      blogCategories,
      "All Posts",
      "all-posts",
      "/blog",
      "Browse all our blog content",
      "posts",
    )

    const videoSubItems = buildCategorySubItems(
      videoCategories,
      "All Videos",
      "all-videos",
      "/watch",
      "Browse our complete video library",
      "videos",
    )

    return [
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
  }, [blogCategories, videoCategories])

  return (
    <div
      className={cn(
        "home-navigation fixed inset-x-0 top-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-slate-950/90 shadow-lg backdrop-blur supports-[backdrop-filter]:backdrop-blur"
          : "bg-transparent",
      )}
    >
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center space-x-2" aria-label="Flavor Studios home">
          <span className="text-xl font-semibold uppercase tracking-wide text-white drop-shadow-md">
            Flavor Studios
          </span>
        </Link>

        <div className="hidden items-center space-x-6 md:flex">
          <MegaMenu
            items={menuItems}
            className="[&_a[role=menuitem]]:!text-slate-200 [&_a[role=menuitem]]:hover:!text-white [&_button[role=menuitem]]:!text-slate-200 [&_button[role=menuitem]]:hover:!text-white"
          />
          <SearchFeature />
          <Button asChild variant="default" className="bg-orange-700 text-white hover:bg-orange-800">
            <Link href="/support">
              <Coffee className="mr-2 h-4 w-4" />
              Buy Me a Coffee
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <SearchFeature />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                aria-expanded={isSheetOpen}
                aria-controls="mobile-navigation"
                variant="ghost"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent id="mobile-navigation" side="right" className="w-[300px] sm:w-[400px]">
              <div className="mt-8">
                <MobileMegaMenu items={menuItems} onItemClick={() => setIsSheetOpen(false)} />
                <Button
                  asChild
                  className="mt-6 w-full bg-orange-700 text-white hover:bg-orange-800"
                >
                  <Link href="/support">
                    <Coffee className="mr-2 h-4 w-4" />
                    Support Us
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  )
}