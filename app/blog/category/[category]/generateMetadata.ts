import { blogCategories } from "@/lib/blogCategories"
import type { Metadata } from "next"

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = blogCategories[params.category]
  if (!category) return {}
  return {
    title: category.title,
    description: category.description,
  }
}
