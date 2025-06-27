// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock } from "lucide-react";
import CommentSection from "./components/comment-section";
import SocialShare from "./components/social-share";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE, SITE_LOGO_URL } from "@/lib/constants"; // SITE_LOGO_URL is used by getSchema internally
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

// BlogPost type interface for type safety
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string, optional
  author?: string;
  views?: number;
  readTime?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: "published" | "draft";
  tags?: string[];
}

// Fetch blog post by slug from API
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || SITE_URL}/api/admin/blogs`,
      { next: { revalidate: 3600 } } // Data will be re-fetched at most every 3600 seconds (1 hour)
    );
    if (!response.ok) {
      console.error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const posts: BlogPost[] = data.posts || [];
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
    const fallbackImage = `${SITE_URL}/cover.jpg`; // Use a general site image for 404s.

    return getMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path: `/blog/${params.slug}`,
      robots: "noindex, follow", // Important for 404s: don't index, but follow links.
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: getCanonicalUrl(`/blog/${params.slug}`), // Ensure fallback OG URL is canonical.
        type: "article", // Still 'article' as the intent was a blog post.
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
      // alternates handled by getMetadata.
    });
  }

  // Use SEO-specific fields from the post if available, otherwise fall back to main fields.
  const ogImage = post.coverImage || SITE_DEFAULT_IMAGE;
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;

  // Generate metadata using your helper function.
  return getMetadata({
    title: `${seoTitle} – ${SITE_NAME}`,
    description: seoDescription,
    path: `/blog/${post.slug}`,
    robots: "index,follow", // This page should be indexed.
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "article", // Specify 'article' type for blog posts.
      title: seoTitle,
      description: seoDescription,
      // 'url' and 'siteName' are set by getMetadata based on 'path' and constants.
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_BRAND_TWITTER,
      creator: SITE_BRAND_TWITTER,
      images: [ogImage],
      title: seoTitle,
      description: seoDescription,
    },
    // 'Canonical/alternates' handled by getMetadata helper.
  });
}

// Main BlogPost page (server component)
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  // If post is not found or not published, trigger Next.js not-found page.
  if (!post) notFound();

  // Determine author schema based on post.author (Person or Organization).
  // Assumes SITE_NAME is the organization name.
  const articleAuthorSchema =
    post.author === SITE_NAME
      ? { "@type": "Organization", name: SITE_NAME }
      : { "@type": "Person", name: post.author || SITE_NAME }; // Fallback to SITE_NAME if author is empty.

  // --- Article Schema JSON-LD (modular, rendered only for valid posts) ---
  // This schema provides rich snippet potential for blog articles.
  // Properties are passed directly to getSchema thanks to its new flexible API.
  const articleSchema = getSchema({
    type: "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage || SITE_DEFAULT_IMAGE, // Main image for the article schema.
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt, // Use updatedAt if available, otherwise publishedAt.
    author: articleAuthorSchema, // Dynamically set author as Person or Organization.
    headline: post.title, // The main headline of the article.
    // REMOVED: Explicit 'publisher' object removed, as getSchema now handles it automatically for Article type.
    // publisher, url, name, description, image, etc. are handled by getSchema automatically.
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Inject Article schema (for Google/SEO) --- */}
      <StructuredData schema={articleSchema} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.category && <Badge variant="outline">{post.category}</Badge>}
            {post.publishedAt && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" /> {/* Added aria-hidden */}
                {/* Format date for readability */}
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.author && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" aria-hidden="true" /> {/* Added aria-hidden */}
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" aria-hidden="true" /> {/* Added aria-hidden */}
              {(post.views || 0).toLocaleString()} views
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" /> {/* Added aria-hidden */}
                {post.readTime}
              </span>
            )}
          </div>
        </header>

        {/* Featured Image Section */}
        {post.coverImage && (
          <div className="mb-8">
            <img
              src={post.coverImage}
              alt={post.title || "Blog post cover image"} // Add a fallback alt text
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Blog Post Content */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* Social Share Component */}
        <SocialShare
          title={post.title}
          excerpt={post.excerpt}
          url={`${SITE_URL}/blog/${post.slug}`}
          image={post.coverImage}
        />

        {/* Tags Section */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {/* Make tags clickable using Next.js Link for SPA navigation */}
                  <Link href={`/blog/tag/${encodeURIComponent(tag)}`} className="hover:underline">
                    {tag}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comment Section Component */}
        <CommentSection postId={post.id} postSlug={post.slug} />
      </article>
    </div>
  );
}
