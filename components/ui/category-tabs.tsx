"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CategoryData {
  name: string
  slug: string
  count?: number
}

interface CategoryTabsProps {
  categories: CategoryData[]
  selectedCategory: string
  basePath: string
  type: "blog" | "video"
}

// Default categories that always appear
const DEFAULT_CATEGORIES: CategoryData[] = [
  { name: "Anime News", slug: "anime-news", count: 0 },
  { name: "Reviews", slug: "reviews", count: 0 },
  { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
  { name: "Tutorials", slug: "tutorials", count: 0 },
]

export function CategoryTabs({ categories = [], selectedCategory, basePath, type }: CategoryTabsProps) {
  // Always show categories - use provided ones or fallback to defaults
  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES

  const getCategoryUrl = (categorySlug: string) => {
    if (categorySlug === "all") return basePath
    return `${basePath}?category=${categorySlug}`
  }

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
          {/* All Categories Button */}
          <Link href={basePath}>
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap flex-shrink-0"
            >
              All
              <Badge variant="secondary" className="ml-2 text-xs">
                {displayCategories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
              </Badge>
            </Button>
          </Link>

          {/* Category Buttons */}
          {displayCategories.map((category) => (
            <Link key={category.slug} href={getCategoryUrl(category.slug)}>
              <Button
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap flex-shrink-0"
              >
                {category.name}
                {category.count !== undefined && category.count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
