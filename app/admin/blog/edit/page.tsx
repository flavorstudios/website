import { notFound } from "next/navigation";
import { blogStore } from "@/lib/content-store";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import BlogEditorPageClient from "./BlogEditorPageClient";
import type { BlogPost as StoreBlogPost } from "@/lib/content-store";
import type { BlogPost as EditorBlogPost } from "@/app/admin/dashboard/components/blog-editor";

interface PageProps {
  searchParams: Promise<{ id?: string; slug?: string }>;
}

export const metadata = getMetadata({
  title: `Edit Blog Post – Admin Panel | ${SITE_NAME}`,
  description: `Edit and publish blog posts for ${SITE_NAME}.`,
  path: "/admin/blog/edit",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Edit Blog Post – Admin Panel | ${SITE_NAME}`,
    description: `Edit and publish blog posts for ${SITE_NAME}.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Cover image for ${SITE_NAME} Admin Panel`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Edit Blog Post – Admin Panel | ${SITE_NAME}`,
    description: `Edit and publish blog posts for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// Utility: strip HTML to get word count
function computeWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

export default async function BlogEditPage({ searchParams }: PageProps) {
  const { id, slug } = await searchParams;
  let post: StoreBlogPost | null = null;

  if (id) {
    post = await blogStore.getById(id);
  } else if (slug) {
    post = await blogStore.getBySlug(slug);
  }
  if (!post) notFound();

  // Cast to possible editor type to grab optional fields if they exist
  const maybeEditor = post as unknown as Partial<EditorBlogPost>;

  // Compute/fallback values
  const wordCount = maybeEditor.wordCount ?? computeWordCount(post.content);
  const readTime = maybeEditor.readTime ?? `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  // Fully type-safe, future-proof: fallback all fields
  const safePost: EditorBlogPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    category: post.category,
    categories:
      Array.isArray(post.categories) && post.categories.length > 0
        ? post.categories
        : [post.category],
    tags: post.tags ?? [],
    featuredImage: post.featuredImage ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    seoKeywords: maybeEditor.seoKeywords ?? "",
    openGraphImage: maybeEditor.openGraphImage ?? "",
    schemaType: maybeEditor.schemaType ?? "Article",
    status: post.status,
    featured: maybeEditor.featured ?? false,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
    scheduledFor: maybeEditor.scheduledFor ? new Date(maybeEditor.scheduledFor) : undefined,
    author: post.author ?? "Admin",
    wordCount,
    readTime,
  };

  return (
    <>
      <PageHeader
        title={`Edit Blog Post${safePost.title ? `: ${safePost.title}` : ""}`}
        description="Update your story details before publishing."
        className="sr-only"
        headingClassName="sr-only"
        descriptionClassName="sr-only"
      />
      <BlogEditorPageClient post={safePost} />
    </>
  );
}
