// app/blog/category/[slug]/page.tsx

import siteData from "@/content-data/categories.json";
import BlogPage from "../../page";

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

  // TODO: Fetch blog posts for this category from your preferred data source (e.g., Firebase or static JSON)
  // Example placeholder: Replace with actual fetch as needed
  // const blogPosts = (siteData.BLOG_POSTS || []).filter(
  //   (post) => post.categorySlug === categorySlug
  // );

  // Pass empty array or implement your new fetching logic here
  const blogPosts: any[] = [];

  return (
    <BlogPage
      searchParams={{ ...searchParams, category: categorySlug }}
      category={category}
      blogPosts={blogPosts}
    />
  );
}
