// app/blog/category/[slug]/page.tsx

import { PrismaClient } from "@prisma/client"
import BlogPage from "../../page"

const prisma = new PrismaClient()

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  // Fetching the category based on the slug
  const categorySlug = params.slug

  // Fetch blog posts filtered by category slug
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
    // If category not found, return a 404 page or similar handling
    return <div>Category not found</div>
  }

  // Fetching blog posts for this category
  const blogPosts = await prisma.post.findMany({
    where: {
      category: { slug: categorySlug },
    },
    orderBy: { createdAt: "desc" }, // Sort by the most recent posts
    skip: searchParams.page ? (parseInt(searchParams.page) - 1) * 10 : 0,
    take: 10, // Limit to 10 posts per page
  })

  // Pass the category data and blog posts to the BlogPage component
  return (
    <BlogPage
      searchParams={{ ...searchParams, category: categorySlug }}
      category={category}
      blogPosts={blogPosts}
    />
  )
}
