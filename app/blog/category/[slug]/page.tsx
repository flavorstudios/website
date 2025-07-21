// app/blog/category/[slug]/page.tsx

import siteData from "@/content-data/categories.json";
import BlogPage from "../../page";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const categorySlug = params.slug;

  // Find the category from JSON instead of DB
  const category = (siteData.CATEGORIES.blog || []).find(
    (cat) => cat.slug === categorySlug
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  // Fetch blog posts for this category (still using Prisma)
  const blogPosts = await prisma.post.findMany({
    where: {
      category: { slug: categorySlug },
    },
    orderBy: { createdAt: "desc" },
    skip: searchParams.page ? (parseInt(searchParams.page) - 1) * 10 : 0,
    take: 10,
  });

  return (
    <BlogPage
      searchParams={{ ...searchParams, category: categorySlug }}
      category={category}
      blogPosts={blogPosts}
    />
  );
}
