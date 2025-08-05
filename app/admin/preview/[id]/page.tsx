import { notFound } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { blogStore, type BlogPost } from "@/lib/content-store";
import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_BRAND_TWITTER, SITE_DEFAULT_IMAGE, SITE_NAME } from "@/lib/constants";
import { locales, defaultLocale } from "@/i18n";
import { createTranslator } from "next-intl";
import { StructuredData } from "@/components/StructuredData";
import BlogPostRenderer from "@/components/BlogPostRenderer";

interface PreviewPageProps {
  params: { id: string; locale?: string };
}

async function getPost(id: string): Promise<BlogPost | null> {
  try {
    return await blogStore.getById(id);
  } catch (err) {
    console.error("Failed to fetch blog post:", err);
    return null;
  }
}

// === METADATA WITH I18N SUPPORT ===
export async function generateMetadata({ params }: PreviewPageProps) {
  const locale = params?.locale || defaultLocale;
  const messages = (
    await import(`@/locales/${locale}/common.json`)
  ).default;
  const tSite = createTranslator({ locale, messages, namespace: "site" });
  const t = createTranslator({ locale, messages, namespace: "blog" });

  const post = await getPost(params.id);
  if (!post) {
    const title = t("notFoundTitle", { siteName: tSite("title") });
    const description = t("notFoundDescription", { siteName: tSite("title") });
    return getMetadata({
      title,
      description,
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

// === MAIN PAGE COMPONENT ===
export default async function PreviewPage({ params }: PreviewPageProps) {
  const post = await getPost(params.id);
  if (!post) notFound();

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
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <StructuredData schema={articleSchema} />
        <BlogPostRenderer post={post} />
      </div>
    </AdminAuthGuard>
  );
}
