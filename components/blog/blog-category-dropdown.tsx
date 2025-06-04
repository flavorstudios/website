"use client"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import type { CategoryData } from "@/lib/dynamic-categories"

const CategoryDropdown = dynamic(() => import("@/components/ui/category-dropdown").then(mod => mod.CategoryDropdown), { ssr: false })

interface Props {
  categories: CategoryData[]
  selected: string
}

export function BlogCategoryDropdown({ categories, selected }: Props) {
  const router = useRouter()

  function handleChange(slug: string) {
    const params = new URLSearchParams(window.location.search)
    if (slug === "all") params.delete("category")
    else params.set("category", slug)
    params.delete("page")
    const url = `/blog${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url)
  }

  return (
    <CategoryDropdown
      categories={categories}
      selectedCategory={selected}
      onCategoryChange={handleChange}
    />
  )
}
