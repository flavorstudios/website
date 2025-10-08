import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import {
  blogStore,
  type BlogPost,
  ADMIN_DB_UNAVAILABLE,
} from "@/lib/content-store";
import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogRenderer from "@/components/blog/BlogRenderer";
import { sanitizeHtmlServer } from "@/lib/sanitize/server";
import { HttpError } from "@/lib/http";
import { ErrorBoundary } from "@/app/admin/dashboard/components/ErrorBoundary";
import { verifyAdminSession } from "@/lib/admin-auth";
import {
  validatePreviewTokenOrThrow,
  type PreviewTokenPayload,
} from "@/lib/preview-token";
import {
  ExpiredPreviewTokenError,
  InvalidPreviewTokenError,
} from "@/lib/preview-token-errors";
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
  const reqHeaders = await headers();
  const requestId = reqHeaders.get("x-request-id") || crypto.randomUUID();

  function renderGuardedMessage(message: ReactNode) {
    return (
      <AdminAuthGuard>
        <div className="mx-auto max-w-prose p-6">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
      </AdminAuthGuard>
    );
  }

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
  const invalidMessage = "Invalid token.";
  const expiredMessage = "Preview token expired.";

  let payload: PreviewTokenPayload;

  try {
    payload = validatePreviewTokenOrThrow(token ?? null, { postId: id });
  } catch (error) {
    const isExpired = error instanceof ExpiredPreviewTokenError;
    const statusCode = isExpired ? 410 : 403;
    const message = isExpired ? expiredMessage : invalidMessage;
    logFailure(statusCode, error, userId);
    return renderGuardedMessage(message);
  }

  try {
    const sessionCookie = (await cookies()).get("admin-session")?.value || "";
    const verified = await verifyAdminSession(sessionCookie);
    userId = verified.uid;
  } catch (err) {
    logFailure(403, err, payload.uid);
    return renderGuardedMessage("Access denied.");
  }

  if (payload.uid !== userId) {
    const error = new InvalidPreviewTokenError();
    logFailure(403, error, userId);
    return renderGuardedMessage(invalidMessage);
  }
  let post: BlogPost | null = null;
  try {
    post = await getPost(id);
  } catch (err) {
    if (err instanceof HttpError && err.message === ADMIN_DB_UNAVAILABLE) {
      return renderGuardedMessage(
        <>
          Firestore unavailable. Set <code>FIREBASE_SERVICE_ACCOUNT_KEY</code> to enable previews.
        </>,
      );
    }
    logFailure(500, err, userId);
    console.error("Failed to load post preview:", err);
    return renderGuardedMessage("Unable to load post preview.");
  }
  if (!post) {
    logFailure(404, new Error("Post not found"), userId);
    notFound();
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
          <BlogRenderer post={post} sanitizeHtml={sanitizeHtmlServer} />
        </div>
      </ErrorBoundary>
    </AdminAuthGuard>
  );
}
