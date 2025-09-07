import { notFound } from "next/navigation";
import type { PageProps } from "next";
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

async function getPost(id: string): Promise<BlogPost | null> {
  return blogStore.getById(id);
}

export async function generateMetadata({ params }: PageProps<{ id: string }>) {
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

export default async function PreviewPage({ params }: PageProps<{ id: string }>) {
  const { id } = await params;
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
    throw err;
  }
  if (!post) {
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
          <BlogPostRenderer post={post} />
        </div>
      </ErrorBoundary>
    </AdminAuthGuard>
  );
}
