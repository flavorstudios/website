// app/blog/category/[slug]/page.tsx

import siteData from "@/content-data/categories.json";
import BlogPage from "../../page";

/**
 * Blog Category Route
 * Finds the blog category from JSON (static) by slug.
 * You can replace blogPosts logic with a live data fetch when ready.
 */
export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const categorySlug = params.slug;

  // --- Robustly find the category (case-insensitive, defensive fallback) ---
  const category =
    (siteData.CATEGORIES?.blog || []).find(
      (cat) => cat.slug?.toLowerCase() === categorySlug?.toLowerCase()
    ) || null;

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center text-lg font-semibold text-gray-600">
        Category not found
      </div>
    );
  }

  // --- TODO: Fetch blog posts for this category (replace this placeholder) ---
  // Codex: If you have a static blog source, filter by category/categories array
  // If you move to dynamic DB fetch, replace this logic accordingly
  // Example (static): 
  // const blogPosts = (siteData.BLOG_POSTS || []).filter(
  //   (post) =>
  //     post.category === categorySlug ||
  //     (Array.isArray(post.categories) && post.categories.includes(categorySlug))
  // );
  const blogPosts: any[] = [];

  return (
    <BlogPage
      searchParams={{ ...searchParams, category: categorySlug }}
      category={category}
      blogPosts={blogPosts}
    />
  );
}
