"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Matches your Category schema
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  postCount?: number
}

interface BlogCategoriesProps {
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}

export function BlogCategories({ activeCategory = "all", onCategoryChange }: BlogCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState(activeCategory)

  // Fetch categories from your API (or directly from store in RSC/server)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?type=blog", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch categories")
        const data = await res.json()
        setCategories([
          { id: "all", name: "All", slug: "all", postCount: undefined },
          ...data.categories.filter((cat: Category) => cat.isActive)
        ])
      } catch (error) {
        // Fallback if API fails (should almost never happen)
        setCategories([{ id: "all", name: "All", slug: "all" }])
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    setSelectedCategory(activeCategory)
  }, [activeCategory])

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    onCategoryChange?.(categorySlug)
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.slug)}
            className="flex items-center gap-2"
          >
            {category.name}
            {category.postCount !== undefined && category.postCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.postCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}