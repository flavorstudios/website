import type { Metadata } from "next"
import { notFound } from "next/navigation"
import watchCategories, { type WatchCategory } from "@/lib/watchCategories"

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  // Check if the category exists
  if (!Object.keys(watchCategories).includes(params.category)) {
    notFound()
  }

  const category = params.category as WatchCategory
  const categoryData = watchCategories[category]

  return {
    title: `${categoryData.heading} - Flavor Studios Videos`,
    description: categoryData.intro,
    openGraph: {
      title: `${categoryData.heading} - Flavor Studios Videos`,
      description: categoryData.intro,
      url: `https://flavorstudios.in/watch/category/${params.category}`,
      siteName: "Flavor Studios",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryData.heading} - Flavor Studios Videos`,
      description: categoryData.intro,
    },
  }
}
