// lib/formatters.ts

/**
 * Formats a blog object for safe public API responses.
 * Only exposes non-admin fields.
 */
export function formatPublicBlog(blog: any) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    featuredImage: blog.featuredImage,
    category: blog.category,
    tags: blog.tags,
    publishedAt: blog.publishedAt,
    readTime: blog.readTime,
    views: blog.views,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
  };
}

/**
 * Formats a video object for safe public API responses.
 * Only exposes non-admin fields.
 */
export function formatPublicVideo(video: any) {
  return {
    id: video.id,
    title: video.title,
    slug: video.slug || video.id,
    youtubeId: video.youtubeId,
    thumbnail: video.thumbnail,
    description: video.description,
    category: video.category,
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
export function formatPublicStats(stats: any) {
  // Adjust this function if you ever need to hide fields in stats
  return stats;
}
