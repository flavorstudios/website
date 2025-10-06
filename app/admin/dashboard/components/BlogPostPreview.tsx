"use client";

import { useMemo } from "react";
import BlogRenderer from "@/components/blog/BlogRenderer";
import { sanitizeHtmlClient } from "@/lib/sanitize/client";
import { ensureHtmlContent } from "@/lib/html-content-client";
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
    const rawContent = post?.content;

    const hasUsableString =
      typeof rawContent === "string" && rawContent.trim().length > 0;

    const contentForSanitization = hasUsableString
      ? rawContent
      : ensureHtmlContent(rawContent);

    if (typeof contentForSanitization !== "string" || !contentForSanitization.trim()) {
      return { sanitized: "", sanitizationError: null as string | null };
    }

    try {
      return {
        sanitized: sanitizeHtmlClient(contentForSanitization),
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

  const derivedEmpty = typeof empty === "boolean" ? empty : sanitized.trim().length === 0;

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