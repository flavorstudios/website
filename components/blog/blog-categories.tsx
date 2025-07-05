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
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  // categories?: Category[]   // Not needed: we always fetch fresh from API
}

export function BlogCategories({
  activeCategory = "all",
  onCategoryChange,
}: BlogCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(activeCategory)

  useEffect(() => {
    setSelectedCategory(activeCategory)
  }, [activeCategory])

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/categories") // This should return categories from Prisma
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch categories")
        const data = await res.json()
        // Supports either { categories } or { blogCategories }
        const cats: Category[] =
          data.categories ||
          data.blogCategories ||
          []
        setCategories(cats)
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    onCategoryChange?.(categorySlug)
  }

  const fallbackCategories: Category[] = [
    { id: "all", name: "All", slug: "all", count: undefined },
  ]

  const displayCategories =
    categories.length > 0
      ? [{ id: "all", name: "All", slug: "all" }, ...categories]
      : fallbackCategories

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <span className="text-sm text-gray-400">Loading...</span>
        ) : (
          displayCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category.slug)}
              className="flex items-center gap-2"
            >
              {category.name}
              {typeof category.count === "number" && category.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
