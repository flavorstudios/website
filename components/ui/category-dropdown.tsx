"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Filter } from "lucide-react"
import type { CategoryData } from "@/lib/dynamic-categories"

interface CategoryDropdownProps {
  categories: CategoryData[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  placeholder?: string
  className?: string
}

export function CategoryDropdown({
  categories,
  selectedCategory,
  onCategoryChange,
  placeholder = "Select category",
  className,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  const selectedCategoryData = categories.find((cat) => cat.slug === selectedCategory)
  const displayText = selectedCategoryData?.name || placeholder

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between min-w-[180px] ${className}`}
          aria-label="Filter by category"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="truncate">{displayText}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[180px] max-h-64 overflow-y-auto"
      >
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.slug}
            onClick={() => {
              onCategoryChange(category.slug)
              setIsOpen(false)
            }}
            className={`cursor-pointer ${selectedCategory === category.slug ? "bg-blue-50 text-blue-700" : ""}`}
          >
            {isAdmin ? (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{category.name}</span>
                {category.count > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{category.count}</span>
                )}
              </div>
              ) : (
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  {category.count > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{category.count}</span>
                  )}
                </div>
                {category.tooltip && (
                  <span className="text-xs text-gray-500 mt-0.5">{category.tooltip}</span>
                )}
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
