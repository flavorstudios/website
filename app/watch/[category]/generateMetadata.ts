import type { Metadata } from "next"
import watchCategories, { type WatchCategory } from "@/lib/watchCategories"

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  // Check if the category exists
  if (!Object.keys(watchCategories).includes(params.category)) {
    return {
      title: "Category Not Found",
      description: "The requested video category does not exist.",
    }
  }

  const category = params.category as WatchCategory
  const categoryData = watchCategories[category]

  return {
    title: `${categoryData.title} | Flavor Studios Videos`,
    description: categoryData.description,
    openGraph: {
      title: `${categoryData.title} | Flavor Studios Videos`,
      description: categoryData.description,
      images: categoryData.featuredImage ? [categoryData.featuredImage] : [],
    },
  }
}
