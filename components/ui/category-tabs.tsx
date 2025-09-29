"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CategoryData } from "@/lib/dynamic-categories"
import Link from "next/link"

interface CategoryTabsProps {
  categories: CategoryData[]
  selectedCategory: string
  onCategoryChange?: (category: string) => void
  basePath?: string
  showAll?: boolean
  className?: string
}

const ALL_CATEGORY_SLUGS = new Set(["all", "all-posts", "all-videos"])

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
  basePath = "/blog",
  showAll = true,
  className,
}: CategoryTabsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const normalizedSelected = selectedCategory.toLowerCase()

  const isCategorySelected = (slug: string) => {
    const normalizedSlug = slug.toLowerCase()
    if (ALL_CATEGORY_SLUGS.has(normalizedSelected) && ALL_CATEGORY_SLUGS.has(normalizedSlug)) {
      return true
    }
    return normalizedSlug === normalizedSelected
  }

  // Only add a generic "All" tab if there isn't already a context-aware all-tab
  const allSlugs = ["all", "all-posts", "all-videos"]
  const hasCustomAll = categories.some(cat =>
    allSlugs.includes(cat.slug.toLowerCase())
  )

  const allCategories = showAll && !hasCustomAll
    ? [{ name: "All", slug: "all", count: 0 }, ...categories]
    : categories

  // Update scroll button states
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 2)
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollButtons)
      window.addEventListener("resize", checkScrollButtons)
      return () => {
        container.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [categories.length])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollAmount = 200
    container.scrollTo({
      left: direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center">
        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border shadow-sm rounded-full"
            onClick={() => scroll("left")}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Tabs */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-8 md:px-0 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allCategories.map((category) => {
            const active = isCategorySelected(category.slug)

            if (onCategoryChange) {
              return (
                <Button
                  key={category.slug}
                  title={(category as CategoryData).tooltip}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap flex-shrink-0 transition-all duration-200 min-h-[36px] px-4",
                    active
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
                  )}
                  onClick={() => onCategoryChange(category.slug)}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className="ml-2 text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  )}
                </Button>
              )
            }

            return (
              <Button
                key={category.slug}
                title={(category as CategoryData).tooltip}
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn(
                  "whitespace-nowrap flex-shrink-0 transition-all duration-200 min-h-[36px] px-4",
                  active
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
                )}
                asChild
              >
                <Link
                  title={(category as CategoryData).tooltip}
                  href={(() => {
                    const params = new URLSearchParams()
                    if (category.slug !== "all") params.set("category", category.slug)
                    return `${basePath}${params.toString() ? `?${params.toString()}` : ""}`
                  })()}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className="ml-2 text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  )}
                </Link>
              </Button>
            )
          })}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border shadow-sm rounded-full"
            onClick={() => scroll("right")}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
