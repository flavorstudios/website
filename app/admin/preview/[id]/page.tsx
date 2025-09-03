import { notFound } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { serverEnv } from "@/env/server";
import { blogStore, type BlogPost } from "@/lib/content-store";
import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogPostRenderer from "@/components/BlogPostRenderer";
import { isAdminSdkAvailable } from "@/lib/firebase-admin";
interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string): Promise<BlogPost | null> {
  try {
    return await blogStore.getById(id);
  } catch (err) {
    console.error("Failed to fetch blog post:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PreviewPageProps) {
  const { id } = await params;
  const post = await getPost(id);
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

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const adminSdkAvailable = isAdminSdkAvailable();
  const post = await getPost(id);
  if (!post) {
    if (!adminSdkAvailable) {
      return (
        <AdminAuthGuard apiKey={serverEnv.ADMIN_API_KEY}>
          <div className="p-8 text-center">
            <p className="text-gray-700">
              Firestore unavailable. Set <code>FIREBASE_SERVICE_ACCOUNT_KEY</code> to enable previews.
            </p>
          </div>
        </AdminAuthGuard>
      );
    }
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
    <AdminAuthGuard apiKey={serverEnv.ADMIN_API_KEY}>
      <div className="min-h-screen bg-gray-50">
        <StructuredData schema={articleSchema} />
        <BlogPostRenderer post={post} />
      </div>
    </AdminAuthGuard>
  );
}
