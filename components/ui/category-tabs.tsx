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
  type?: string
  showAll?: boolean
  className?: string
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
  basePath,
  showAll = true,
  className,
}: CategoryTabsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const allCategories = showAll ? [{ name: "All", slug: "all", count: 0 }, ...categories] : categories

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
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
  }, [categories])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 200
    const newScrollLeft =
      direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
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
            className="absolute left-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border shadow-sm rounded-full"
            onClick={() => scroll("left")}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Category tabs container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-8 md:px-0 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allCategories.map((category) => {
            return onCategoryChange ? (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                className={cn(
                  "whitespace-nowrap flex-shrink-0 transition-all duration-200 min-h-[36px] px-4",
                  selectedCategory === category.slug
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
                )}
                onClick={() => {
                  if (onCategoryChange) {
                    onCategoryChange(category.slug)
                  } else if (basePath) {
                    const params = new URLSearchParams()
                    if (category.slug !== "all") params.set("category", category.slug)
                    const url = `${basePath}${params.toString() ? `?${params.toString()}` : ""}`
                    window.location.href = url
                  }
                }}
              >
                {category.name}
                {category.count > 0 && (
                  <span className="ml-2 text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">
                    {category.count}
                  </span>
                )}
              </Button>
            ) : (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                className={cn(
                  "whitespace-nowrap flex-shrink-0 transition-all duration-200 min-h-[36px] px-4",
                  selectedCategory === category.slug
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
                )}
                asChild
              >
                <Link
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
            className="absolute right-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border shadow-sm rounded-full"
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
