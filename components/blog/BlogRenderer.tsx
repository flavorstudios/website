import type { AriaAttributes, ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Eye, FileText, AlertTriangle, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/app/(marketing)/blog/[slug]/components/comment-section";
import SocialShare from "@/app/(marketing)/blog/[slug]/components/social-share";
import { SITE_URL } from "@/lib/constants";
import type { BlogPost as StoreBlogPost } from "@/lib/content-store";
import type { PublicBlogDetail } from "@/lib/types";
import { isAllowedImageUrl } from "@/lib/image-domains";
import { safeDateLabel } from "@/lib/safe-date";
import { normalizeAuthor } from "@/lib/author-normalizer";
import { ensureHtmlContent } from "@/lib/html-content-client";

export type BlogRendererPost = PublicBlogDetail | StoreBlogPost;

export interface BlogRendererProps {
  post?: BlogRendererPost | null;
  /**
   * When provided, the renderer will use this HTML instead of sanitising itself.
   * Useful for client components that need to memoize sanitisation.
   */
  sanitizedHtml?: string;
  /**
   * Optional sanitiser allowing server callers to defer sanitisation to the renderer.
   */
  sanitizeHtml?: (html: string) => string;
  isLoading?: boolean;
  error?: string | null;
  empty?: boolean;
}

function BlogRendererSkeleton() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-3/4 bg-gray-200 rounded" />
          <div className="h-5 w-1/2 bg-gray-200 rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-64 w-full bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-5 w-full bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </article>
  );
}

interface StateMessageProps {
  title: string;
  description: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: AriaAttributes["aria-hidden"];
  }>;
  variant?: "error" | "muted";
}

function StateMessage({ title, description, icon: Icon, variant = "muted" }: StateMessageProps) {
  const colorClasses =
    variant === "error"
      ? "bg-red-50 text-red-700 border border-red-200"
      : "bg-gray-50 text-gray-600 border border-gray-200";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={`rounded-lg p-8 text-center ${colorClasses}`}>
        <Icon className="mx-auto mb-4 h-10 w-10" aria-hidden="true" />
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-base">{description}</p>
      </div>
    </article>
  );
}

function resolveSanitizedHtml({
  post,
  sanitizedHtml,
  sanitizeHtml,
}: Pick<BlogRendererProps, "post" | "sanitizedHtml" | "sanitizeHtml">) {
  if (typeof sanitizedHtml === "string") {
    return sanitizedHtml;
  }

  if (!post) {
    return "";
  }

  const hasNonEmptyStringContent =
    typeof post.content === "string" && post.content.trim().length > 0;

  const recoveredHtml = hasNonEmptyStringContent
    ? post.content
    : ensureHtmlContent(post.content);

  if (!hasNonEmptyStringContent && recoveredHtml.trim().length === 0) {
    console.warn("BlogRenderer: Failed to recover HTML from post content.", {
      postId: "id" in post ? post.id : undefined,
      slug: "slug" in post ? post.slug : undefined,
      contentType: typeof post.content,
    });
  }

  if (typeof sanitizeHtml === "function") {
    try {
      return sanitizeHtml(recoveredHtml);
    } catch (error) {
      console.error("Failed to sanitise blog content:", error);
      return "";
    }
  }

  return recoveredHtml;
}

export default function BlogRenderer({
  post,
  sanitizedHtml,
  sanitizeHtml,
  isLoading = false,
  error,
  empty,
}: BlogRendererProps) {
  if (isLoading) {
    return <BlogRendererSkeleton />;
  }

  if (error) {
    return (
      <StateMessage
        title="We couldn’t load this story"
        description={error}
        icon={AlertTriangle}
        variant="error"
      />
    );
  }

  if (!post || empty) {
    return (
      <StateMessage
        title="Nothing to show yet"
        description="Start writing or paste in your content to see a live preview."
        icon={FileText}
      />
    );
  }

  const primaryCategory =
    post.categories && post.categories.length > 0 ? post.categories[0] : post.category;

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
    normalizedAuthor && normalizedAuthor !== fallbackAuthor ? normalizedAuthor : null;

  const articleHtml = resolveSanitizedHtml({ post, sanitizedHtml, sanitizeHtml });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {primaryCategory && <Badge variant="outline">{primaryCategory}</Badge>}
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
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
            dangerouslySetInnerHTML={{ __html: articleHtml }}
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

      {post.id && <CommentSection postId={post.id} />}
    </article>
  );
}