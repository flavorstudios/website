"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CategoryData } from "@/lib/dynamic-categories"

interface CategoryDropdownProps {
  categories: CategoryData[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  type: "blog" | "video"
  placeholder?: string
  showAll?: boolean
  className?: string
}

export function CategoryDropdown({
  categories,
  selectedCategory,
  onCategoryChange,
  type,
  placeholder,
  showAll = true,
  className,
}: CategoryDropdownProps) {
  const allCategories = showAll ? [{ name: "All Categories", slug: "all", count: 0 }, ...categories] : categories

  const defaultPlaceholder = `All ${type === "blog" ? "Blog" : "Video"} Categories`

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className={className || "w-48"}>
        <SelectValue placeholder={placeholder || defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {allCategories.map((category) => (
          <SelectItem key={category.slug} value={category.slug}>
            <div className="flex items-center justify-between w-full">
              <span>{category.name}</span>
              {category.count > 0 && <span className="ml-2 text-xs text-muted-foreground">({category.count})</span>}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
