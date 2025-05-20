import type { Metadata } from "next"
import blogCategories, { type BlogCategory } from "@/lib/blogCategories"

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  // Check if the category exists
  if (!Object.keys(blogCategories).includes(params.category)) {
    return {
      title: "Category Not Found",
      description: "The requested blog category does not exist.",
    }
  }

  const category = params.category as BlogCategory
  const categoryData = blogCategories[category]

  return {
    title: `${categoryData.title} | Flavor Studios Blog`,
    description: categoryData.description,
    openGraph: {
      title: `${categoryData.title} | Flavor Studios Blog`,
      description: categoryData.description,
      images: categoryData.featuredImage ? [categoryData.featuredImage] : [],
    },
  }
}
