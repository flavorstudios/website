// lib/formatters.ts

import type { BlogPost } from "./content-store"; // Adjust path if needed
import type { Video } from "./content-store";    // Adjust path if needed

/**
 * Formats a blog object for safe public API responses.
 * Only exposes non-admin fields.
 * Adds .categories[] for multi-category support (fallbacks to [category]).
 * Adds .commentCount for badge support.
 */
export function formatPublicBlog(blog: BlogPost) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    featuredImage: blog.featuredImage,
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
    commentCount: typeof blog.commentCount === "number" ? blog.commentCount : 0,
  };
}

/**
 * Formats a video object for safe public API responses.
 * Only exposes non-admin fields.
 * Adds .categories[] for multi-category support (fallbacks to [category]).
 */
export function formatPublicVideo(video: Video) {
  return {
    id: video.id,
    title: video.title,
    slug: video.slug, // Use slug only; no fallback to id
    youtubeId: video.youtubeId,
    thumbnail: video.thumbnail,
    description: video.description,
    category: video.category,
    categories: Array.isArray(video.categories) && video.categories.length > 0
      ? video.categories
      : [video.category],
    tags: video.tags,
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
