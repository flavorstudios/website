import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { BlogPost } from "@/lib/content-store";
import { blogStore, ADMIN_DB_UNAVAILABLE } from "@/lib/content-store";
import { publishToUser } from "@/lib/sse-broker";
import { logActivity } from "@/lib/activity-log";
import { hasE2EBypass } from "@/lib/e2e-utils";
import { getE2EBlogPosts } from "@/lib/e2e-fixtures";
import { serverEnv } from "@/env/server";
import {
  DEFAULT_PAGE_SIZE,
  clampPageSize,
  decodeIndexCursor,
  encodeIndexCursor,
} from "@/lib/pagination";

function parseOptionalIsoDate(
  value: unknown,
  field: string,
): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error(`Invalid ${field} timestamp`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${field} timestamp`);
  }
  return date.toISOString();
}

// GET: Fetch all blogs for admin dashboard (with filtering, sorting, pagination)
export async function GET(request: NextRequest) {
  const allowDemoContent =
    serverEnv.USE_DEMO_CONTENT === "true" ||
    process.env.USE_DEMO_CONTENT === "true";
  const bypass = allowDemoContent && hasE2EBypass(request);

  if (!bypass && !(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const search = (
      searchParams.get("q") ||
      searchParams.get("search") ||
      ""
    ).toLowerCase();
    const category = (searchParams.get("category") || "all").toLowerCase();
    const statusParam = searchParams.get("status");
    const status = (statusParam || "published").toLowerCase();
    const sort = (searchParams.get("sort") || "date").toLowerCase();
    const sortDirParam = (searchParams.get("sortDir") || "desc").toLowerCase();
    const sortDir = sortDirParam === "asc" ? "asc" : "desc";
    const authorParam = (searchParams.get("author") || "").toLowerCase();
    const tagParam = (searchParams.get("tag") || "").toLowerCase();
    const rawLimit = Number.parseInt(searchParams.get("limit") || "", 10);
    const includeAll = ["1", "true"].includes(
      (searchParams.get("all") || "").toLowerCase(),
    );
    const limit = includeAll
      ? undefined
      : clampPageSize(
          Number.isNaN(rawLimit) ? undefined : rawLimit,
          DEFAULT_PAGE_SIZE,
        );
    const cursorParam = searchParams.get("cursor");
    const decodedCursor = decodeIndexCursor(cursorParam);

    if (cursorParam && decodedCursor === null) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const startIndex = includeAll ? 0 : (decodedCursor ?? 0);

    const blogs = bypass ? getE2EBlogPosts() : await blogStore.getAll();

    const filtered = blogs.filter((blog: BlogPost) => {
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
          (value) =>
            typeof value === "string" && value.toLowerCase() === category,
        );
        if (!matchesCategory) {
          return false;
        }
      }

      if (authorParam) {
        const author = blog as unknown as {
          author?: unknown;
          authorId?: unknown;
        };
        const normalizedAuthor = authorParam.toLowerCase();
        const matches = [
          typeof author.author === "string" && author.author.toLowerCase(),
          typeof author.authorId === "string" && author.authorId.toLowerCase(),
          typeof author.author === "object" &&
          author.author &&
          typeof (author.author as { id?: unknown }).id === "string"
            ? ((author.author as { id?: string }).id ?? "").toLowerCase()
            : null,
          typeof author.author === "object" &&
          author.author &&
          typeof (author.author as { name?: unknown }).name === "string"
            ? ((author.author as { name?: string }).name ?? "").toLowerCase()
            : null,
        ].some(
          (value) => typeof value === "string" && value === normalizedAuthor,
        );
        if (!matches) {
          return false;
        }
      }

      if (tagParam) {
        const tags = Array.isArray(blog.tags) ? blog.tags : [];
        const matchesTag = tags.some(
          (value) =>
            typeof value === "string" && value.toLowerCase() === tagParam,
        );
        if (!matchesTag) {
          return false;
        }
      }

      if (search) {
        const fields = [
          blog.title,
          blog.excerpt,
          blog.content,
          blog.slug,
          ...(Array.isArray(blog.tags) ? blog.tags : []),
        ];
        const matchesSearch = fields.some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(search),
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
        return (
          direction * String(a.title || "").localeCompare(String(b.title || ""))
        );
      }
      if (sort === "status") {
        return (
          direction *
          String(a.status || "").localeCompare(String(b.status || ""))
        );
      }
      if (sort === "views") {
        return (
          direction * (((a.views ?? 0) as number) - ((b.views ?? 0) as number))
        );
      }
      if (sort === "comments") {
        return (
          direction *
          (((a.commentCount ?? 0) as number) -
            ((b.commentCount ?? 0) as number))
        );
      }

    const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return direction * (aDate - bDate);
    });

    const total = filtered.length;
    const effectiveLimit = includeAll ? total : (limit ?? DEFAULT_PAGE_SIZE);
    const endIndex = Math.min(startIndex + effectiveLimit, total);
    const slice = filtered.slice(startIndex, endIndex);

    const items = slice.map((blog) => ({
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

    if (bypass) {
      console.info("/api/admin/blogs responding with demo content (bypass)");
    }

    return NextResponse.json({ items, nextCursor, total }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs", items: [], total: 0 },
      { status: 500 },
    );
  }
}

// POST: Create a new blog post
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blogData = await request.json();

    // Validate required fields
    if (!blogData.title || !blogData.content) {
      return NextResponse.json(
        {
          error: "Title and content are required",
        },
        { status: 400 },
      );
    }

    // Generate a safe slug
    const slug =
      blogData.slug ||
      blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Always strip HTML for the excerpt!
    const plain =
      typeof blogData.content === "string"
        ? blogData.content.replace(/<[^>]*>/g, "")
        : "";
    const generatedExcerpt =
      plain.length > 160 ? plain.substring(0, 160) + "..." : plain;
    const excerpt = blogData.excerpt || generatedExcerpt;

    // Create the blog post
    let scheduledForIso: string | undefined;
    let publishedAtIso: string | undefined;
    try {
      scheduledForIso = parseOptionalIsoDate(
        blogData.scheduledFor,
        "scheduledFor",
      );
      publishedAtIso = parseOptionalIsoDate(
        blogData.publishedAt,
        "publishedAt",
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: (error as Error).message || "Invalid timestamp",
        },
        { status: 400 },
      );
    }

    const status: BlogPost["status"] =
      blogData.status === "published" || blogData.status === "scheduled"
        ? blogData.status
        : "draft";
    const nowIso = new Date().toISOString();
    const computedPublishedAt =
      status === "published"
        ? (publishedAtIso ?? nowIso)
        : (publishedAtIso ??
          (status === "scheduled" ? (scheduledForIso ?? nowIso) : nowIso));

    const blog = await blogStore.create({
      title: blogData.title,
      slug,
      content: blogData.content,
      excerpt,
      status,
      category: blogData.category || "Episodes",
      categories: Array.isArray(blogData.categories)
        ? blogData.categories
        : [blogData.category || "Episodes"],
      tags: blogData.tags || [],
      featuredImage: blogData.featuredImage || "",
      seoTitle: blogData.seoTitle || blogData.title,
      seoDescription: blogData.seoDescription || excerpt,
      author: blogData.author || "Flavor Studios",
      publishedAt: computedPublishedAt,
      readTime: blogData.readTime || "5 min read",
      scheduledFor: scheduledForIso,
      // commentCount and shareCount default to 0 by the store model
    });

    // Notify connected admin clients via SSE
    publishToUser("blog", "posts", {});

    const actor = await getSessionInfo(request);
    await logActivity({
      type: "blog.create",
      title: blog.title,
      description: `Created blog ${blog.title}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });

    if (blog.status === "published") {
      revalidatePath("/blog");
      if (blog.slug) {
        revalidatePath(`/blog/${blog.slug}`);
      }
    }

    return NextResponse.json(
      {
        ...blog,
        commentCount: blog.commentCount ?? 0,
        shareCount: blog.shareCount ?? 0,
        scheduledFor: blog.scheduledFor,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    const message = (error as Error).message;
    if (message === ADMIN_DB_UNAVAILABLE) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json(
      {
        error: "Failed to create blog",
      },
      { status: 500 },
    );
  }
}
