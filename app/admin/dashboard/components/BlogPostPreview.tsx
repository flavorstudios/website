"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock } from "lucide-react";
import CommentSection from "@/app/blog/[slug]/components/comment-section";
import SocialShare from "@/app/blog/[slug]/components/social-share";
import { SITE_URL } from "@/lib/constants";
import type { BlogPost as StoreBlogPost } from "@/lib/content-store";
import type { PublicBlogDetail } from "@/lib/types";
import { sanitizeHtmlClient } from "@/lib/sanitize/client";
import { isAllowedImageUrl } from "@/lib/image-domains";
import { safeDateLabel } from "@/lib/safe-date";
import { normalizeAuthor } from "@/lib/formatters";

interface BlogPostPreviewProps {
  post: PublicBlogDetail | StoreBlogPost;
}

export default function BlogPostPreview({ post }: BlogPostPreviewProps) {
  const primaryCategory =
    post.categories && post.categories.length > 0
      ? post.categories[0]
      : post.category;

  const image = post.openGraphImage || post.featuredImage;
  const isAllowedImage = image ? isAllowedImageUrl(image) : false;
  const publishedAtLabel = safeDateLabel(post.publishedAt, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const normalizedAuthor = normalizeAuthor(post.author);
  const fallbackAuthor = normalizeAuthor(undefined);
  const authorLabel =
    normalizedAuthor && normalizedAuthor !== fallbackAuthor
      ? normalizedAuthor
      : null;

  const sanitizedContent = useMemo(
    () => sanitizeHtmlClient(post.content || ""),
    [post.content],
  );

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {primaryCategory && (
            <Badge variant="outline">{primaryCategory}</Badge>
          )}
          {publishedAtLabel && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {publishedAtLabel}
            </span>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {authorLabel && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" aria-hidden="true" />
              {authorLabel}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" aria-hidden="true" />
            {(post.views ?? 0).toLocaleString()} views
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
        <div className="mb-8 w-full h-64 md:h-96 relative rounded-lg shadow-lg overflow-hidden">
          {isAllowedImage ? (
            <Image
              src={image}
              alt={post.title || "Blog post cover image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1024px"
              priority
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={post.title || "Blog post cover image"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      )}

      <Card className="mb-12">
        <CardContent className="p-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{
              __html: sanitizedContent,
            }}
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
                <Link
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="hover:underline"
                >
                  {tag}
                </Link>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {post.id && <CommentSection postId={post.id} />}
    </article>
  );
}