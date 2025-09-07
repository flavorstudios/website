import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import {
  blogStore,
  type BlogPost,
  ADMIN_DB_UNAVAILABLE,
} from "@/lib/content-store";
import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogPostRenderer from "@/components/BlogPostRenderer";
import { HttpError } from "@/lib/http";
import { ErrorBoundary } from "@/app/admin/dashboard/components/ErrorBoundary";
import { verifyAdminSession } from "@/lib/admin-auth";
import { validatePreviewToken } from "@/lib/preview-token";
import { logError } from "@/lib/log";
import crypto from "crypto";

async function getPost(id: string): Promise<BlogPost | null> {
  return blogStore.getById(id);
}

interface PreviewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: PreviewPageProps) {
  const { id } = await params;
  let post: BlogPost | null = null;
  try {
    post = await getPost(id);
  } catch (err) {
    if (err instanceof HttpError && err.message === ADMIN_DB_UNAVAILABLE) {
      const title = `Preview Unavailable – ${SITE_NAME}`;
      return getMetadata({
        title,
        description: "Firestore unavailable. Set FIREBASE_SERVICE_ACCOUNT_KEY to enable previews.",
        path: `/admin/preview/${id}`,
        robots: "noindex, nofollow",
      });
    }
    console.error("Failed to fetch blog post:", err);
  }
  if (!post) {
    const title = `Post Not Found – ${SITE_NAME}`;
    return getMetadata({
      title,
      description: "Post not found",
      path: `/admin/preview/${id}`,
      robots: "noindex, nofollow",
    });
  }
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;
  const ogImage = post.openGraphImage || post.featuredImage || SITE_DEFAULT_IMAGE;
  return getMetadata({
    title: `${seoTitle} – Preview`,
    description: seoDescription,
    path: `/admin/preview/${post.id}`,
    robots: "noindex, nofollow",
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: post.schemaType || "article",
      title: seoTitle,
      description: seoDescription,
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_BRAND_TWITTER,
      creator: SITE_BRAND_TWITTER,
      images: [ogImage],
      title: seoTitle,
      description: seoDescription,
    },
  });
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const reqHeaders = headers();
  const requestId = reqHeaders.get("x-request-id") || crypto.randomUUID();

  function logFailure(status: number, err: unknown, uid?: string) {
    const e = err instanceof Error ? err : new Error(String(err));
    const stack = e.stack?.split("\n").slice(0, 20).join("\n");
    logError("admin-preview", {
      requestId,
      uid: uid || null,
      postId: id,
      status,
      errorClass: e.constructor.name,
      message: e.message,
      stack,
    });
  }

  let userId: string | undefined;
  try {
    const sessionCookie = cookies().get("admin-session")?.value || "";
    const verified = await verifyAdminSession(sessionCookie);
    userId = verified.uid;
  } catch (err) {
    logFailure(403, err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!token) {
    logFailure(403, new Error("Missing token"), userId);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const validation = validatePreviewToken(token, id, userId);
  if (validation === "invalid") {
    logFailure(403, new Error("Invalid token"), userId);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (validation === "expired") {
    logFailure(410, new Error("Expired token"), userId);
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }
  let post: BlogPost | null = null;
  try {
    post = await getPost(id);
  } catch (err) {
    if (err instanceof HttpError && err.message === ADMIN_DB_UNAVAILABLE) {
      return (
        <AdminAuthGuard>
          <div className="p-8 text-center">
            <p className="text-gray-700">
              Firestore unavailable. Set <code>FIREBASE_SERVICE_ACCOUNT_KEY</code> to enable previews.
            </p>
          </div>
        </AdminAuthGuard>
      );
    }
    logFailure(500, err, userId);
    throw err;
  }
  if (!post) {
    logFailure(404, new Error("Post not found"), userId);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const articleSchema = getSchema({
    type: post.schemaType || "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.openGraphImage || post.featuredImage || SITE_DEFAULT_IMAGE,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { "@type": "Person", name: post.author || SITE_NAME },
    headline: post.title,
  });

  return (
    <AdminAuthGuard>
      <ErrorBoundary
        fallback={
          <div className="p-8 text-center">
            <p className="text-gray-700">Failed to render post preview.</p>
          </div>
        }
      >
        <div className="min-h-screen bg-gray-50">
          <StructuredData schema={articleSchema} />
          <BlogPostRenderer post={post} />
        </div>
      </ErrorBoundary>
    </AdminAuthGuard>
  );
}
