"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CategoryData {
  name: string
  slug: string
  count?: number
  description?: string
}

interface CategoryTabsProps {
  categories: CategoryData[]
  selectedCategory: string
  onCategoryChange?: (category: string) => void
  basePath?: string
  showAll?: boolean
  className?: string
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
  basePath = "",
  showAll = true,
  className,
}: CategoryTabsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const allTabs = showAll
    ? [{ name: "All", slug: "all", count: 0 }, ...categories]
    : categories

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [categories])

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex items-center">
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border rounded-full shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-8 md:px-0 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allTabs.map((cat) => {
            const isSelected = selectedCategory === cat.slug || (!selectedCategory && cat.slug === "all")

            const sharedClasses = cn(
              "flex-shrink-0 whitespace-nowrap min-h-[36px] px-4 transition-all duration-200",
              isSelected
                ? "bg-blue-600 text-white shadow font-semibold"
                : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
              "rounded-full border text-sm"
            )

            const label = cat.name
            const badge =
              cat.slug !== "all" &&
              cat.count &&
              cat.count > 0 && (
                <span className="ml-2 text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">
                  {cat.count}
                </span>
              )

            return onCategoryChange ? (
              <Button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                variant={isSelected ? "default" : "outline"}
                className={sharedClasses}
              >
                {label} {badge}
              </Button>
            ) : (
              <Button key={cat.slug} variant="outline" className={sharedClasses} asChild>
                <Link
                  href={
                    cat.slug === "all"
                      ? basePath
                      : `${basePath}?category=${encodeURIComponent(cat.slug)}`
                  }
                >
                  {label} {badge}
                </Link>
              </Button>
            )
          })}
        </div>

        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border rounded-full shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}