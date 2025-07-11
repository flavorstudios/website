// app/blog/category/[slug]/page.tsx

import BlogPage from "../../page"

export default function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  return <BlogPage searchParams={{ ...searchParams, category: params.slug }} />
}
