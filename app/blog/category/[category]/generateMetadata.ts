import type { Metadata } from "next"
import { notFound } from "next/navigation"
import blogCategories, { type BlogCategory } from "@/lib/blogCategories"

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  // Check if the category exists
  if (!Object.keys(blogCategories).includes(params.category)) {
    notFound()
  }

  const category = params.category as BlogCategory
  const categoryData = blogCategories[category]

  return {
    title: `${categoryData.heading} - Flavor Studios Blog`,
    description: categoryData.intro,
    openGraph: {
      title: `${categoryData.heading} - Flavor Studios Blog`,
      description: categoryData.intro,
      url: `https://flavorstudios.in/blog/category/${params.category}`,
      siteName: "Flavor Studios",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryData.heading} - Flavor Studios Blog`,
      description: categoryData.intro,
    },
  }
}
