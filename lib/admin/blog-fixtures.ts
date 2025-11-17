import type { BlogPost } from "@/lib/types";
import {
  DEFAULT_PAGE_SIZE,
  clampPageSize,
  decodeIndexCursor,
  encodeIndexCursor,
} from "@/lib/pagination";

export type AdminBlogListItem = Pick<
  BlogPost,
  | "id"
  | "title"
  | "slug"
  | "content"
  | "excerpt"
  | "status"
  | "category"
  | "categories"
  | "tags"
  | "featuredImage"
  | "seoTitle"
  | "seoDescription"
  | "author"
  | "publishedAt"
  | "scheduledFor"
  | "createdAt"
  | "updatedAt"
  | "views"
  | "readTime"
  | "commentCount"
  | "shareCount"
>;

export type ParsedAdminBlogQuery = {
  filters: AdminBlogFilters;
  invalidCursor: boolean;
};

export type AdminBlogFilters = {
  search: string;
  category: string;
  status: string;
  sort: "title" | "status" | "views" | "comments" | "date";
  sortDir: "asc" | "desc";
  author: string;
  tag: string;
  includeAll: boolean;
  limit?: number;
  startIndex: number;
};

const fixtureCategories = ["news", "updates", "features"] as const;
const fixtureAuthors = ["Alex Rivera", "Jordan Singh", "Morgan Wu", "Priya Nair"];
const fixtureTags = ["general", "feature", "spotlight", "ops"];

export function getAdminBlogFixtures({ total = 60 }: { total?: number } = {}): BlogPost[] {
  return Array.from({ length: total }, (_, idx) => {
    const index = idx + 1;
    const category = fixtureCategories[idx % fixtureCategories.length];
    const author = fixtureAuthors[idx % fixtureAuthors.length];
    const tag = fixtureTags[idx % fixtureTags.length];
    const status = index % 15 === 0 ? "draft" : index % 20 === 0 ? "scheduled" : "published";
    const scheduledFor =
      status === "scheduled"
        ? new Date(Date.UTC(2024, 5, index % 28)).toISOString()
        : undefined;
    const publishedAt =
      status === "scheduled"
        ? undefined
        : new Date(Date.UTC(2024, 0, index)).toISOString();
    const createdAt = new Date(Date.UTC(2023, 11, index)).toISOString();
    const updatedAt = publishedAt ?? scheduledFor ?? createdAt;

    return {
      id: `admin-fixture-post-${index}`,
      title: `Post ${index}`,
      slug: `post-${index}`,
      content: `<p>Post ${index} content</p>`,
      excerpt: `Excerpt ${index}`,
      status,
      category,
      categories: [category],
      tags: [tag],
      featuredImage: "/placeholder.png",
      seoTitle: `SEO ${index}`,
      seoDescription: `SEO description ${index}`,
      author,
      publishedAt: publishedAt ?? new Date(Date.UTC(2024, 0, index)).toISOString(),
      scheduledFor,
      createdAt,
      updatedAt,
      views: 100 + index,
      readTime: `${3 + (index % 5)} min`,
      commentCount: index % 7,
      shareCount: index % 5,
    } satisfies BlogPost;
  });
}

export function parseAdminBlogQuery(searchParams: URLSearchParams): ParsedAdminBlogQuery {
  const search =
    (searchParams.get("q") || searchParams.get("search") || "").toLowerCase();
  const category = (searchParams.get("category") || "all").toLowerCase();
  const status = (searchParams.get("status") || "published").toLowerCase();
  const sortParam = (searchParams.get("sort") || "date").toLowerCase();
  const sort: AdminBlogFilters["sort"] =
    sortParam === "title" ||
    sortParam === "status" ||
    sortParam === "views" ||
    sortParam === "comments"
      ? sortParam
      : "date";
  const sortDirParam = (searchParams.get("sortDir") || "desc").toLowerCase();
  const sortDir: AdminBlogFilters["sortDir"] = sortDirParam === "asc" ? "asc" : "desc";
  const author = (searchParams.get("author") || "").toLowerCase();
  const tag = (searchParams.get("tag") || "").toLowerCase();
  const rawLimit = Number.parseInt(searchParams.get("limit") || "", 10);
  const includeAll = ["1", "true"].includes(
    (searchParams.get("all") || "").toLowerCase(),
  );
  const limit = includeAll
    ? undefined
    : clampPageSize(Number.isNaN(rawLimit) ? undefined : rawLimit, DEFAULT_PAGE_SIZE);
  const cursorParam = searchParams.get("cursor");
  const decodedCursor = decodeIndexCursor(cursorParam);
  const invalidCursor = Boolean(cursorParam && decodedCursor === null);
  const startIndex = includeAll ? 0 : decodedCursor ?? 0;

  return {
    invalidCursor,
    filters: {
      search,
      category,
      status,
      sort,
      sortDir,
      author,
      tag,
      includeAll,
      limit,
      startIndex,
    },
  };
}

export function filterAndPaginateAdminBlogs(
  blogs: BlogPost[],
  filters: AdminBlogFilters,
): { items: AdminBlogListItem[]; total: number; nextCursor?: string } {
  const {
    search,
    category,
    status,
    sort,
    sortDir,
    author,
    tag,
    includeAll,
    limit,
    startIndex,
  } = filters;

  const normalizedSearch = search.trim();
  const normalizedAuthor = author.trim();
  const normalizedTag = tag.trim();

  const filtered = blogs.filter((blog) => {
    const blogStatus = String(blog.status || "").toLowerCase();
    if (status !== "all" && blogStatus !== status) {
      return false;
    }

    if (category !== "all" && category.length > 0) {
      const categories = Array.isArray(blog.categories)
        ? blog.categories
        : typeof blog.category === "string"
          ? [blog.category]
          : [];
      const matchesCategory = categories.some(
        (value) => typeof value === "string" && value.toLowerCase() === category,
      );
      if (!matchesCategory) {
        return false;
      }
    }

    if (normalizedAuthor) {
      const rawBlog = blog as Record<string, unknown>;
      const authorCandidates = [
        typeof blog.author === "string" ? blog.author.toLowerCase() : null,
        typeof rawBlog.authorId === "string"
          ? (rawBlog.authorId as string).toLowerCase()
          : null,
        typeof rawBlog.author === "object" && rawBlog.author !== null
          ? typeof (rawBlog.author as { id?: unknown }).id === "string"
            ? ((rawBlog.author as { id?: string }).id ?? "").toLowerCase()
            : null
          : null,
        typeof rawBlog.author === "object" && rawBlog.author !== null
          ? typeof (rawBlog.author as { name?: unknown }).name === "string"
            ? ((rawBlog.author as { name?: string }).name ?? "").toLowerCase()
            : null
          : null,
      ].filter((value): value is string => Boolean(value));
      const authorMatches = authorCandidates.some((value) => value === normalizedAuthor);
      if (!authorMatches) {
        return false;
      }
    }

    if (normalizedTag) {
      const tags = Array.isArray(blog.tags) ? blog.tags : [];
      const matchesTag = tags.some(
        (value) => typeof value === "string" && value.toLowerCase() === normalizedTag,
      );
      if (!matchesTag) {
        return false;
      }
    }

    if (normalizedSearch) {
      const fields = [
        blog.title,
        blog.excerpt,
        blog.content,
        blog.slug,
        ...(Array.isArray(blog.tags) ? blog.tags : []),
      ];
      const matchesSearch = fields.some(
        (value) => typeof value === "string" && value.toLowerCase().includes(normalizedSearch),
      );
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });

  filtered.sort((a, b) => {
    const direction = sortDir === "asc" ? 1 : -1;
    if (sort === "title") {
      return direction * String(a.title || "").localeCompare(String(b.title || ""));
    }
    if (sort === "status") {
      return direction * String(a.status || "").localeCompare(String(b.status || ""));
    }
    if (sort === "views") {
      return direction * (((a.views ?? 0) as number) - ((b.views ?? 0) as number));
    }
    if (sort === "comments") {
      return direction * (((a.commentCount ?? 0) as number) - ((b.commentCount ?? 0) as number));
    }

    const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return direction * (aDate - bDate);
  });

  const total = filtered.length;
  const effectiveLimit = includeAll ? total : limit ?? DEFAULT_PAGE_SIZE;
  const endIndex = Math.min(startIndex + effectiveLimit, total);
  const slice = filtered.slice(startIndex, endIndex);

  const items = slice.map<AdminBlogListItem>((blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    status: blog.status,
    category: blog.category,
    categories: blog.categories,
    tags: blog.tags,
    featuredImage: blog.featuredImage,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    author: blog.author,
    publishedAt: blog.publishedAt,
    scheduledFor: blog.scheduledFor,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    views: blog.views,
    readTime: blog.readTime,
    commentCount: blog.commentCount ?? 0,
    shareCount: blog.shareCount ?? 0,
  }));

  const nextCursor =
    includeAll || endIndex >= total ? undefined : encodeIndexCursor(endIndex);

  return { items, total, nextCursor };
}