// app/watch/category/[slug]/page.tsx

import { PrismaClient } from "@prisma/client"
import WatchPage from "../../page"

const prisma = new PrismaClient()

export default async function WatchCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  // Fetching the category based on the slug
  const categorySlug = params.slug

  // Fetch category details based on the slug
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: {
      name: true,
      slug: true,
      postCount: true,
      tooltip: true,
    },
  })

  if (!category) {
    // If category not found, return a 404 or similar handling
    return <div>Category not found</div>
  }

  // Fetching videos for this category
  const videos = await prisma.video.findMany({
    where: {
      category: { slug: categorySlug },
    },
    orderBy: { createdAt: "desc" }, // Sort by the most recent videos
    skip: searchParams.page ? (parseInt(searchParams.page) - 1) * 10 : 0,
    take: 10, // Limit to 10 videos per page
  })

  // Pass the category data and videos to the WatchPage component
  return (
    <WatchPage
      searchParams={{ ...searchParams, category: categorySlug }}
      category={category}
      videos={videos}
    />
  )
}
