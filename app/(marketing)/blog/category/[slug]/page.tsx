// app/blog/category/[slug]/page.tsx
// If advanced routing is needed, extend BlogPage to accept `category` and
// `blogPosts` props directly and update app/blog/page.tsx to match.

import siteData from "@/content-data/categories.json" assert { type: "json" };
import BlogPage from "../../page";
import Link from "next/link";
import type { PageProps } from "@/types/next";

type BlogCategoryPageProps = PageProps<{ slug: string }, { page?: string }>;

/**
 * Blog Category Route
 * Finds the blog category from JSON (static) by slug.
 * To support passing category/blogPosts, update BlogPage props in app/blog/page.tsx.
 */
export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const categorySlug = slug;

  // --- Robustly find the category (case-insensitive, defensive fallback) ---
  const category =
    (siteData.CATEGORIES?.blog || []).find(
      (cat) => cat.slug?.toLowerCase() === categorySlug?.toLowerCase()
    ) || null;

  if (!category) {
    // On-brand, friendly fallback with gradient and SVG
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 px-4">
        <div className="max-w-md text-center bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mx-auto mb-6 h-16 w-16 text-purple-500 drop-shadow-lg"
            fill="currentColor"
          >
            <path d="M12 2l2.9 7.5L22 10l-5.6 4.2L17.9 22 12 17.6 6.1 22l1.5-7.8L2 10l7.1-.5L12 2z" />
          </svg>
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Sorry, this category doesn&apos;t exist.
          </h2>
          <Link href="/blog" className="text-blue-600 font-medium hover:underline">
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // --- If you wish to filter blogPosts, do it here. ---
  // e.g. const blogPosts = ...

  // BlogPage currently only accepts `searchParams`.
  // To pass `category` or `blogPosts`, extend BlogPage’s props in app/blog/page.tsx.
  return (
    <BlogPage
      searchParams={{
        ...resolvedSearchParams,
        category: categorySlug,
      }}
    />
  );
}