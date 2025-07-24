import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock } from "lucide-react";
import CommentSection from "@/app/blog/[slug]/components/comment-section";
import SocialShare from "@/app/blog/[slug]/components/social-share";
import { SITE_URL } from "@/lib/constants";

interface BlogPostRendererProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category?: string;
    categories?: string[];
    publishedAt?: string;
    author?: string;
    views?: number;
    readTime?: string;
    coverImage?: string;
    featuredImage?: string;
    openGraphImage?: string;
    tags?: string[];
  };
}

export default function BlogPostRenderer({ post }: BlogPostRendererProps) {
  const primaryCategory =
    post.categories && post.categories.length > 0
      ? post.categories[0]
      : post.category;

  const image = post.openGraphImage || post.coverImage || post.featuredImage;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {primaryCategory && <Badge variant="outline">{primaryCategory}</Badge>}
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
      {image && (
        <div className="mb-8">
          <img
            src={image}
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
        image={image}
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
  );
}
