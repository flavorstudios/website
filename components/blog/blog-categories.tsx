"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count?: number
}

interface BlogCategoriesProps {
  categories?: Category[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}

export function BlogCategories({ categories = [], activeCategory = "all", onCategoryChange }: BlogCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState(activeCategory)

  useEffect(() => {
    setSelectedCategory(activeCategory)
  }, [activeCategory])

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    onCategoryChange?.(categorySlug)
  }

  // Default categories if none provided
  const defaultCategories: Category[] = [
    { id: "1", name: "All", slug: "all", count: 0 },
    { id: "2", name: "Anime News", slug: "anime-news", count: 0 },
    { id: "3", name: "Reviews", slug: "reviews", count: 0 },
    { id: "4", name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
    { id: "5", name: "Tutorials", slug: "tutorials", count: 0 },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {displayCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.slug)}
            className="flex items-center gap-2"
          >
            {category.name}
            {category.count !== undefined && category.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
