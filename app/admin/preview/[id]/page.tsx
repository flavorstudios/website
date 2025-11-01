import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { PageHeader } from "@/components/admin/page-header";
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
import { validatePreviewToken } from "@/lib/preview/validate";
import {
  ExpiredPreviewTokenError,
  InvalidPreviewTokenError,
} from "@/lib/preview-token-errors";
import { logError } from "@/lib/log";
import crypto from "crypto";
import { ValidateSessionPing } from "@/components/ValidateSessionPing";
import type { PageProps } from "@/types/next";

async function getPost(id: string): Promise<BlogPost | null> {
  return blogStore.getById(id);
}

async function validateSessionViaApi(reqHeaders: Headers) {
  const forwardedHost = reqHeaders.get("x-forwarded-host") ?? undefined;
  const host = reqHeaders.get("host") ?? forwardedHost;
  const prefersHttp = host?.startsWith("localhost") || host?.startsWith("127.0.0.1");
  const proto = reqHeaders.get("x-forwarded-proto") ?? (prefersHttp ? "http" : "https");

  const fallbackOrigin =
    process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "http://127.0.0.1:3000";
  const origin = host ? `${proto}://${host}` : fallbackOrigin;

  try {
    const cookieStore = await cookies();
    const serializedCookies = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    await fetch(new URL("/api/admin/validate-session", origin).toString(), {
      headers: serializedCookies ? { cookie: serializedCookies } : undefined,
      cache: "no-store",
    });
  } catch {
    // Ignore network issues; preview should still render
  }
}

type PreviewPageProps = PageProps<{ id: string }, { token?: string }>;

export async function generateMetadata({ params }: PreviewPageProps) {
  const { id } = params;
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
  const { id } = params;
  const { token } = searchParams ?? {};
  const reqHeaders = await headers();
  const requestId = reqHeaders.get("x-request-id") || crypto.randomUUID();
  const isE2E =
    process.env.E2E === "true" ||
    process.env.E2E === "1" ||
    process.env.NEXT_PUBLIC_E2E === "true" ||
    process.env.NEXT_PUBLIC_E2E === "1";

    await validateSessionViaApi(reqHeaders);

  function renderGuardedMessage(message: ReactNode, heading = "Admin Preview") {
    const title = typeof heading === "string" && heading.trim() ? heading : "Admin Preview";
    return (
      <AdminAuthGuard>
        <ValidateSessionPing />
        <div className="mx-auto max-w-prose space-y-4 p-6">
          <PageHeader
            level={1}
            title={title}
            className="sr-only"
            headingClassName="sr-only"
            descriptionClassName="sr-only"
          />
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
      </AdminAuthGuard>
    );
  }

  if (isE2E) {
    return renderGuardedMessage("E2E Preview Mode");
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

  const validation = await validatePreviewToken({
    id,
    token,
    isE2E,
  });

  if (!validation.ok) {
    const isExpired = validation.reason === "expired";
    const error = isExpired
      ? new ExpiredPreviewTokenError()
      : new InvalidPreviewTokenError();
    logFailure(isExpired ? 410 : 403, error, userId);
    return renderGuardedMessage(isExpired ? expiredMessage : invalidMessage);
  }

  const payload = validation.payload;

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
