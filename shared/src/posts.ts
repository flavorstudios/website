import { FALLBACK_POSTS } from "./data/fallback-posts";
import type {
  BlogPostRecord,
  GetPostsFilters,
  PublicPostDetail,
  PublicPostSummary,
} from "./types";

function normalizeCategories(categories?: unknown, fallback?: unknown): string[] {
  const normalized = Array.isArray(categories)
    ? categories.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  if (normalized.length > 0) {
    return normalized.map((value) => value.trim());
  }
  if (typeof fallback === "string") {
    const trimmed = fallback.trim();
    if (trimmed.length > 0) {
      return [trimmed];
    }
  }
  return [];
}

function parseAuthor(author?: unknown): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") return author;
  if (typeof author === "object") {
    const record = author as { id?: string; name?: string };
    return record.name || record.id;
  }
  return undefined;
}

function parseDateInput(value?: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatPostSummary(post: BlogPostRecord): PublicPostSummary {
  const categories = normalizeCategories(post.categories, post.category);
  const category = post.category?.trim() || categories[0] || "";
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
    featured: Boolean(post.featured),
    author: parseAuthor(post.author),
    publishedAt: post.publishedAt,
    categories,
    category,
    commentCount: typeof post.commentCount === "number" ? post.commentCount : 0,
    shareCount: typeof post.shareCount === "number" ? post.shareCount : 0,
    views: post.views,
    readTime: post.readTime,
    tags: Array.isArray(post.tags) ? post.tags : undefined,
  };
}

function formatPostDetail(post: BlogPostRecord): PublicPostDetail {
  const summary = formatPostSummary(post);
  return {
    ...summary,
    content: typeof post.content === "string" ? post.content : "",
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    schemaType: post.schemaType,
    openGraphImage: post.openGraphImage,
  };
}

function withinDateRange(
  post: BlogPostRecord,
  filters: Required<Pick<GetPostsFilters, "startDate" | "endDate">>,
): boolean {
  if (!filters.startDate && !filters.endDate) return true;
  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
  if (!publishedAt || Number.isNaN(publishedAt.getTime())) return false;
  if (filters.startDate && publishedAt < filters.startDate) return false;
  if (filters.endDate && publishedAt > filters.endDate) return false;
  return true;
}

export async function getPosts(filters: GetPostsFilters = {}): Promise<PublicPostSummary[]> {
  const authorFilter = filters.author?.toLowerCase();
  const startDate = parseDateInput(filters.startDate);
  if (filters.startDate !== undefined && filters.startDate !== null && !startDate) {
    throw new Error("Invalid startDate");
  }

  const endDateRaw = parseDateInput(filters.endDate);
  if (filters.endDate !== undefined && filters.endDate !== null && !endDateRaw) {
    throw new Error("Invalid endDate");
  }

  const endDate = endDateRaw
    ? new Date(new Date(endDateRaw).setHours(23, 59, 59, 999))
    : null;

  const published = FALLBACK_POSTS.filter((post) => post.status === "published");

  const filteredByAuthor = authorFilter && authorFilter !== "all"
    ? published.filter((post) => {
        const source = parseAuthor(post.author)?.toLowerCase();
        return Boolean(source && source === authorFilter);
      })
    : published;

  const filtered = filteredByAuthor.filter((post) =>
    withinDateRange(post, { startDate, endDate }),
  );

  return filtered.map((post) => formatPostSummary(post));
}

export async function getPostBySlug(slug: string): Promise<PublicPostDetail | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }
  const match = FALLBACK_POSTS.find(
    (post) => post.slug?.toLowerCase() === normalizedSlug || post.id === slug,
  );
  return match ? formatPostDetail(match) : null;
}