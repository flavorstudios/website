import { load } from "cheerio";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { BlogPost } from "@/lib/content-store";
import { blogStore, ADMIN_DB_UNAVAILABLE } from "@/lib/content-store";
import { publishToUser } from "@/lib/sse-broker";
import { logActivity } from "@/lib/activity-log";
import {
  filterAndPaginateAdminBlogs,
  getAdminBlogFixtures,
  parseAdminBlogQuery,
} from "@/lib/admin/blog-fixtures";
import { shouldUseAdminBlogFixtures } from "@/lib/admin/blog-fixture-guard";

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

const MAX_CONTENT_LENGTH = 50_000;

function toPlainText(html: unknown) {
  if (typeof html !== "string") {
    return "";
  }

  const limitedHtml = html.length > MAX_CONTENT_LENGTH
    ? html.slice(0, MAX_CONTENT_LENGTH)
    : html;

  const $ = load(limitedHtml, { decodeEntities: true });
  const body = $("body");
  const text = body.length ? body.text() : $.text();
  return text.trim();
}

// GET: Fetch all blogs for admin dashboard (with filtering, sorting, pagination)
export async function GET(request: NextRequest) {
  const useFixtures = shouldUseAdminBlogFixtures(request);

  if (!useFixtures && !(await requireAdmin(request, "canManageBlogs"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const { filters, invalidCursor } = parseAdminBlogQuery(searchParams);

    if (invalidCursor) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const blogs = useFixtures ? getAdminBlogFixtures() : await blogStore.getAll();
    const response = filterAndPaginateAdminBlogs(blogs, filters);

    if (useFixtures) {
      console.info("/api/admin/blogs responding with deterministic fixtures");
    }

    return NextResponse.json(response, { status: 200 });
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

    if (typeof blogData.title !== "string" || typeof blogData.content !== "string") {
      return NextResponse.json(
        { error: "Title and content must be strings" },
        { status: 400 },
      );
    }

    if (blogData.content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` },
        { status: 413 },
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
    const plain = toPlainText(blogData.content);
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
