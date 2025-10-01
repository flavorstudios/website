// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogRenderer from "@/components/blog/BlogRenderer";
import { sanitizeHtmlServer } from "@/lib/sanitize/server";
import { getBlogPost } from "@/lib/blog";
// ⬇️ Use shared public type instead of declaring locally!
import type { PublicBlogDetail } from "@/lib/types";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// SEO metadata (dynamic per post, using Next.js generateMetadata API)
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post: PublicBlogDetail | null = null;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  // Fallback metadata for posts not found or not published (noindex, follow)
  if (!post) {
    const fallbackTitle = `Post Not Found – ${SITE_NAME}`;
    const fallbackDescription = `Sorry, this blog post could not be found. Explore more inspiring anime blog posts at ${SITE_NAME}.`;
    const fallbackImage = `${SITE_URL}/cover.jpg`;

    return getMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path: `/blog/${slug}`,
      robots: "noindex, follow",
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: getCanonicalUrl(`/blog/${slug}`),
        type: "article",
        images: [{ url: fallbackImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        site: SITE_BRAND_TWITTER,
        creator: SITE_BRAND_TWITTER,
        title: fallbackTitle,
        description: fallbackDescription,
        images: [fallbackImage],
      },
    });
  }

  // --- Codex fix: use featuredImage consistently ---
  const ogImage =
    post.openGraphImage ||
    post.featuredImage ||
    SITE_DEFAULT_IMAGE;

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;
  const schemaType = post.schemaType || "Article";

  return getMetadata({
    title: `${seoTitle} – ${SITE_NAME}`,
    description: seoDescription,
    path: `/blog/${post.slug}`,
    robots: "index,follow",
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: schemaType,
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

// Main BlogPost page (server component)
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post: PublicBlogDetail | null = null;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  // If post is not found or not published, trigger Next.js not-found page.
  if (!post) notFound();

  // --- Codex fix: use featuredImage consistently ---
  const articleSchema = getSchema({
    type: post.schemaType || "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.openGraphImage || post.featuredImage || SITE_DEFAULT_IMAGE,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author:
      post.author === SITE_NAME
        ? { "@type": "Organization", name: SITE_NAME }
        : { "@type": "Person", name: post.author || SITE_NAME },
    headline: post.title,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Inject Article schema (for Google/SEO) --- */}
      <StructuredData schema={articleSchema} />
      {/* --- Blog Post Renderer (unified) --- */}
      <BlogRenderer post={post} sanitizeHtml={sanitizeHtmlServer} />
    </div>
  );
}
