"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import type { CategoryData } from "@/lib/dynamic-categories"

interface CategoryTabsProps {
  categories: CategoryData[]
  selectedCategory: string
  basePath: string
  type: "blog" | "video"
}

export function CategoryTabs({ categories, selectedCategory, basePath, type }: CategoryTabsProps) {
  const getTabUrl = (categorySlug: string) => {
    if (categorySlug === "all") {
      return basePath
    }
    return `${basePath}?category=${categorySlug}`
  }

  const getTabLabel = (categorySlug: string) => {
    if (categorySlug === "all") {
      return type === "blog" ? "All Posts" : "All Videos"
    }
    const category = categories.find((c) => c.slug === categorySlug)
    return category?.name || categorySlug
  }

  return (
    <section className="bg-white border-b shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Browse by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2">
            {/* All Items Tab */}
            <Link
              href={getTabUrl("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              {getTabLabel("all")}
            </Link>

            {/* Dynamic Category Tabs */}
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={getTabUrl(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === category.slug
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                {category.name}
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    selectedCategory === category.slug
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {category.count}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
