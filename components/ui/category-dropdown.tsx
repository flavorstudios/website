"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CategoryData } from "@/lib/dynamic-categories"

interface CategoryDropdownProps {
  categories: CategoryData[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  type: "blog" | "video"
  placeholder?: string
}

export function CategoryDropdown({
  categories,
  selectedCategory,
  onCategoryChange,
  type,
  placeholder,
}: CategoryDropdownProps) {
  const defaultPlaceholder = type === "blog" ? "All Categories" : "All Categories"

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={placeholder || defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{defaultPlaceholder}</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.slug} value={category.name}>
            <div className="flex items-center justify-between w-full">
              <span>{category.name}</span>
              <span className="text-xs text-gray-500 ml-2">({category.count})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
