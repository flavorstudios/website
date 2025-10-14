// lib/formatters.ts

import type { BlogPost } from "./content-store"; // Adjust path if needed
import type { Video } from "./content-store"; // Adjust path if needed
import type { PublicBlogSummary, PublicBlogDetail } from "./types";
import { normalizeAuthor } from "./author-normalizer";
import { ensureHtmlContent } from "./html-content";

let mediaModulePromise: Promise<typeof import("./media")> | null = null;

/**
 * Formats a blog object for safe public API responses in list views.
 * Only exposes non-admin fields and omits full content.
 * Adds .categories[] for multi-category support (fallbacks to [category]).
 * Adds .commentCount and .shareCount for badge support.
 */
async function maybeEnsureFreshMediaUrl(
  url: string | null | undefined,
): Promise<string | null | undefined> {
  if (url == null) return url;
  if (typeof window !== "undefined") {
    return url;
  }
  if (!mediaModulePromise) {
    mediaModulePromise = import("./media");
  }
  const { ensureFreshMediaUrl } = await mediaModulePromise;
  return ensureFreshMediaUrl(url);
}

export async function formatPublicBlogSummary(
  blog: BlogPost,
): Promise<PublicBlogSummary> {
  const featuredImage =
    (await maybeEnsureFreshMediaUrl(blog.featuredImage)) ?? blog.featuredImage;

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    featuredImage,
    category: blog.category,
    categories: Array.isArray(blog.categories) && blog.categories.length > 0
      ? blog.categories
      : [blog.category],
    tags: blog.tags,
    publishedAt: blog.publishedAt,
    readTime: blog.readTime,
    views: blog.views,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    featured: blog.featured,
    commentCount: typeof blog.commentCount === "number" ? blog.commentCount : 0,
    shareCount: typeof blog.shareCount === "number" ? blog.shareCount : 0,
    author: normalizeAuthor(blog.author),
  };
}

/**
 * Formats a blog object with full details for public API responses.
 * Includes full content and SEO fields while still omitting admin-only
 * properties like status. Ensures categories array and default counts.
 */
export async function formatPublicBlogDetail(
  blog: BlogPost,
): Promise<PublicBlogDetail> {
  const [featuredImage, openGraphImage] = await Promise.all([
    maybeEnsureFreshMediaUrl(blog.featuredImage),
    blog.openGraphImage
      ? maybeEnsureFreshMediaUrl(blog.openGraphImage)
      : Promise.resolve(blog.openGraphImage),
  ]);

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: ensureHtmlContent(blog.content),
    excerpt: blog.excerpt,
    featuredImage: featuredImage ?? blog.featuredImage,
    category: blog.category,
    categories: Array.isArray(blog.categories) && blog.categories.length > 0
      ? blog.categories
      : [blog.category],
    tags: blog.tags,
    author: normalizeAuthor(blog.author),
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    readTime: blog.readTime,
    views: blog.views,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    featured: blog.featured,
    commentCount: typeof blog.commentCount === "number" ? blog.commentCount : 0,
    shareCount: typeof blog.shareCount === "number" ? blog.shareCount : 0,
    schemaType: blog.schemaType,
    openGraphImage: openGraphImage ?? blog.openGraphImage,
  };
}

/**
 * Formats a video object for safe public API responses.
 * Only exposes non-admin fields and ensures categories are always an array.
 */
export function formatPublicVideo(video: Video) {
  const categories =
    Array.isArray(video.categories) && video.categories.length > 0
      ? video.categories
      : video.category
        ? [video.category]
        : [];

  const tags = Array.isArray(video.tags) ? video.tags : [];

  return {
    id: video.id,
    title: video.title,
    slug: video.slug, // Use slug only; no fallback to id
    youtubeId: video.youtubeId,
    thumbnail: video.thumbnail,
    description: video.description,
    category: video.category,
    categories,
    tags,
    duration: video.duration,
    publishedAt: video.publishedAt,
    featured: video.featured,
  };
}

/**
 * Optionally, you can add formatters for other types—like stats, podcasts, etc.
 * Here’s a generic stats passthrough (customize if you want to strip fields).
 */
export function formatPublicStats(stats: Record<string, unknown>) {
  // Adjust this function if you ever need to hide fields in stats
  return stats;
}
