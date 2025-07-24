// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogPostRenderer from "@/components/BlogPostRenderer";

// BlogPost type interface for type safety (multi-category aware)
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categories?: string[];
  publishedAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string, optional
  author?: string;
  views?: number;
  readTime?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  openGraphImage?: string;
  schemaType?: string;
  status: "published" | "draft";
  tags?: string[];
}

// Fetch blog post by slug from PUBLIC API
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || SITE_URL}/api/blogs`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) {
      console.error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const posts: BlogPost[] = Array.isArray(data) ? data : (data.posts || []);
    // Filter for published posts only
    return posts.find((post) => post.slug === slug && post.status === "published") || null;
  } catch (error) {
    console.error("Failed to fetch blog post due to exception:", error);
    return null;
  }
}

interface BlogPostPageProps {
  params: { slug: string };
}

// SEO metadata (dynamic per post, using Next.js generateMetadata API)
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  // Fallback metadata for posts not found or not published (noindex, follow)
  if (!post) {
    const fallbackTitle = `Post Not Found – ${SITE_NAME}`;
    const fallbackDescription = `Sorry, this blog post could not be found. Explore more inspiring anime blog posts at ${SITE_NAME}.`;
    const fallbackImage = `${SITE_URL}/cover.jpg`;

    return getMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path: `/blog/${params.slug}`,
      robots: "noindex, follow",
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: getCanonicalUrl(`/blog/${params.slug}`),
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

  const ogImage =
    post.openGraphImage ||
    post.coverImage ||
    SITE_DEFAULT_IMAGE;

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;
  const schemaType = post.schemaType || "Article";

  // Determine author schema based on post.author (Person or Organization).
  const articleAuthorSchema =
    post.author === SITE_NAME
      ? { "@type": "Organization", name: SITE_NAME }
      : { "@type": "Person", name: post.author || SITE_NAME };

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
  const post = await getBlogPost(params.slug);

  // If post is not found or not published, trigger Next.js not-found page.
  if (!post) notFound();

  // Article Schema JSON-LD (SEO)
  const articleSchema = getSchema({
    type: post.schemaType || "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.openGraphImage || post.coverImage || SITE_DEFAULT_IMAGE,
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
      <BlogPostRenderer post={post} />
    </div>
  );
}
