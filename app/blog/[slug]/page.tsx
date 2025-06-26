// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock } from "lucide-react";
import CommentSection from "./components/comment-section";
import SocialShare from "./components/social-share";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE, SITE_LOGO_URL } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

// BlogPost type
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  views?: number;
  readTime?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: "published" | "draft";
  tags?: string[];
}

// Fetch post by slug
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || SITE_URL}/api/admin/blogs`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const posts: BlogPost[] = data.posts || [];
    return posts.find((post) => post.slug === slug && post.status === "published") || null;
  } catch (error) {
    console.error("Failed to fetch blog post due to exception:", error);
    return null;
  }
}

interface BlogPostPageProps {
  params: { slug: string };
}

// SEO metadata (dynamic per post)
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    const fallbackUrl = getCanonicalUrl(`/blog/${params.slug}`);
    const fallbackTitle = `Post Not Found – ${SITE_NAME}`;
    const fallbackDesc = "This blog post could not be found or is not yet published.";
    const fallbackImage = `${SITE_URL}/cover.jpg`;

    return {
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: { canonical: fallbackUrl },
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        url: fallbackUrl,
        type: "article",
        images: [{ url: fallbackImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        site: SITE_BRAND_TWITTER,
        creator: SITE_BRAND_TWITTER,
        title: fallbackTitle,
        description: fallbackDesc,
        images: [fallbackImage],
      },
      robots: "noindex, follow",
    };
  }

  const ogImage = post.coverImage || SITE_DEFAULT_IMAGE;
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;

  return getMetadata({
    title: `${seoTitle} – ${SITE_NAME}`,
    description: seoDescription,
    path: `/blog/${post.slug}`,
    robots: "index,follow",
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "article",
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

  if (!post) notFound();

  const articleAuthorSchema =
    post.author === SITE_NAME
      ? { "@type": "Organization", name: SITE_NAME }
      : { "@type": "Person", name: post.author || SITE_NAME };

  const articleSchema = getSchema({
    type: "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage || SITE_DEFAULT_IMAGE,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: articleAuthorSchema,
    publisher: {
      name: SITE_NAME,
      logo: SITE_LOGO_URL, // Uses your centralized logo constant
    },
    headline: post.title,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StructuredData schema={articleSchema} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.category && <Badge variant="outline">{post.category}</Badge>}
            {post.publishedAt && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
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
                <User className="h-4 w-4" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {(post.views || 0).toLocaleString()} views
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            )}
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-8">
            <img
              src={post.coverImage}
              alt={post.title || "Blog post cover image"}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        <Card className="mb-12">
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        <SocialShare
          title={post.title}
          excerpt={post.excerpt}
          url={`${SITE_URL}/blog/${post.slug}`}
          image={post.coverImage}
        />

        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Link href={`/blog/tag/${encodeURIComponent(tag)}`} className="hover:underline">
                    {tag}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <CommentSection postId={post.id} postSlug={post.slug} />
      </article>
    </div>
  );
}
