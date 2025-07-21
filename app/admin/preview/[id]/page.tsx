import { notFound } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { blogStore, type BlogPost } from "@/lib/content-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock } from "lucide-react";
import CommentSection from "@/app/blog/[slug]/components/comment-section";
import SocialShare from "@/app/blog/[slug]/components/social-share";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

interface PreviewPageProps {
  params: { id: string };
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
  const post = await getPost(params.id);
  if (!post) {
    const title = `Post Not Found – ${SITE_NAME}`;
    return getMetadata({
      title,
      description: "Post not found",
      path: `/admin/preview/${params.id}`,
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
  const post = await getPost(params.id);
  if (!post) notFound();

  const articleSchema = getSchema({
    type: post.schemaType || "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.featuredImage || SITE_DEFAULT_IMAGE,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { "@type": "Person", name: post.author || SITE_NAME },
    headline: post.title,
  });

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <StructuredData schema={articleSchema} />
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {(post.categories?.[0] || post.category) && (
                <Badge variant="outline">{post.categories?.[0] || post.category}</Badge>
              )}
              {post.publishedAt && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {post.author && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {post.author}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" aria-hidden="true" />
                {(post.views || 0).toLocaleString()} views
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {post.readTime}
                </span>
              )}
            </div>
          </header>
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage}
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
            image={post.featuredImage}
          />
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
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
    </AdminAuthGuard>
  );
}
