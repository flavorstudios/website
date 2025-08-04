// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import BlogPostRenderer from "@/components/BlogPostRenderer";
import type { BlogPost } from "@/lib/content-store";
import { getTranslator, locales, defaultLocale } from "@/lib/i18n";

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
  params: { slug: string; locale?: string };
}

// SEO metadata (dynamic per post, using Next.js generateMetadata API)
export async function generateMetadata({ params }: BlogPostPageProps) {
  const locale = params?.locale || defaultLocale;
  const tSite = getTranslator(locale, "site");
  const t = getTranslator(locale, "blog");

  const post = await getBlogPost(params.slug);
  const pathWithoutLocale = `/blog/${params.slug}`;
  const path = locale === defaultLocale ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`;

  const languageAlternates = Object.fromEntries(
    locales.map((l) => [
      l,
      getCanonicalUrl(l === defaultLocale ? pathWithoutLocale : `/${l}${pathWithoutLocale}`),
    ]),
  );

  // Fallback metadata for posts not found or not published (noindex, follow)
  if (!post) {
    const fallbackTitle = t("notFoundTitle", { siteName: tSite("title") });
    const fallbackDescription = t("notFoundDescription", { siteName: tSite("title") });
    const fallbackImage = `${SITE_URL}/cover.jpg`;

    const meta = getMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path,
      robots: "noindex, follow",
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: getCanonicalUrl(path),
        type: "article",
        images: [{ url: fallbackImage, width: 1200, height: 630 }],
        locale,
        alternateLocale: locales.filter((l) => l !== locale),
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

    return {
      ...meta,
      alternates: {
        ...meta.alternates,
        languages: languageAlternates,
      },
    };
  }

  // --- Codex fix: use featuredImage, not coverImage ---
  const ogImage =
    post.openGraphImage ||
    post.featuredImage ||
    SITE_DEFAULT_IMAGE;

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;
  const schemaType = post.schemaType || "Article";

  const meta = getMetadata({
    title: `${seoTitle} – ${tSite("title")}`,
    description: seoDescription,
    path,
    robots: "index,follow",
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: schemaType,
      title: seoTitle,
      description: seoDescription,
      locale,
      alternateLocale: locales.filter((l) => l !== locale),
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

  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      languages: languageAlternates,
    },
  };
}

// Main BlogPost page (server component)
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  // If post is not found or not published, trigger Next.js not-found page.
  if (!post) notFound();

  // --- Codex fix: use featuredImage, not coverImage ---
  const articleSchema = getSchema({
    type: post.schemaType || "Article",
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.openGraphImage || post.featuredImage || SITE_DEFAULT_IMAGE,
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
