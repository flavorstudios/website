import { getBlogPost } from "./page";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface HeadProps {
  params: { slug: string };
}

// Server component: fetches post data, renders schema for published only
export default async function Head({ params }: HeadProps) {
  const post = await getBlogPost(params.slug);

  // Fallback: If not found or unpublished, do not output JSON-LD
  if (!post) return null;

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.coverImage || `${SITE_URL}/cover.jpg`;
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seoTitle,
    description: seoDescription,
    image: ogImage,
    author: {
      "@type": "Person",
      name: post.author || SITE_NAME,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </>
  );
}
