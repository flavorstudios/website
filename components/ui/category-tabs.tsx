"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CategoryData } from "@/lib/dynamic-categories"

interface CategoryTabsProps {
  categories: CategoryData[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  showAll?: boolean
  className?: string
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
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
      return () => container.removeEventListener("scroll", checkScrollButtons)
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
            className="absolute left-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border shadow-sm"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Category tabs container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-8 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allCategories.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              className={cn(
                "whitespace-nowrap flex-shrink-0 transition-all duration-200",
                selectedCategory === category.slug ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted",
              )}
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.name}
              {category.count > 0 && <span className="ml-1 text-xs opacity-70">({category.count})</span>}
            </Button>
          ))}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border shadow-sm"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
