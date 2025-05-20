import { watchCategories } from "@/lib/watchCategories"
import type { Metadata } from "next"

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = watchCategories[params.category]
  if (!category) return {}
  return {
    title: category.title,
    description: category.description,
  }
}
