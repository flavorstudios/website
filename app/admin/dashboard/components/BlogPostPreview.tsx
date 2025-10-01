"use client";

import { useMemo } from "react";
import BlogRenderer from "@/components/blog/BlogRenderer";
import { sanitizeHtmlClient } from "@/lib/sanitize/client";
import type { BlogPost as StoreBlogPost } from "@/lib/content-store";
import type { PublicBlogDetail } from "@/lib/types";

interface BlogPostPreviewProps {
  post: PublicBlogDetail | StoreBlogPost;
  isLoading?: boolean;
  empty?: boolean;
  error?: string | null;
}

export default function BlogPostPreview({ post, isLoading, empty, error }: BlogPostPreviewProps) {
  const { sanitized, sanitizationError } = useMemo(() => {
    if (!post?.content || typeof post.content !== "string") {
      return { sanitized: "", sanitizationError: null as string | null };
    }

    try {
      return {
        sanitized: sanitizeHtmlClient(post.content),
        sanitizationError: null as string | null,
      };
    } catch (err) {
      console.error("Failed to sanitize preview content:", err);
      return {
        sanitized: "",
        sanitizationError: "We couldn’t render a safe preview of this content.",
      };
    }
  }, [post?.content]);

  const derivedEmpty =
    typeof empty === "boolean"
      ? empty
      : !(typeof post?.content === "string" && post.content.trim().length > 0);

  return (
    <BlogRenderer
      post={post}
      sanitizedHtml={sanitized}
      isLoading={isLoading}
      empty={derivedEmpty}
      error={error ?? sanitizationError}
    />
  );
}