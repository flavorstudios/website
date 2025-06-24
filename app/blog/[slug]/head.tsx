import { getBlogPost } from "./page"; // Use the correct path to your getBlogPost function

interface HeadProps {
  params: { slug: string };
}

// Server component: fetches post data, renders schema for published only
export default async function Head({ params }: HeadProps) {
  const post = await getBlogPost(params.slug);

  // Fallback: If not found or unpublished, do not output JSON-LD
  if (!post) return null;

  const canonicalUrl = `https://flavorstudios.in/blog/${post.slug}`;
  const ogImage = post.coverImage || "https://flavorstudios.in/cover.jpg";
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": seoTitle,
    "description": seoDescription,
    "image": ogImage,
    "author": {
      "@type": "Person",
      "name": post.author || "Flavor Studios",
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "logo": {
        "@type": "ImageObject",
        "url": "https://flavorstudios.in/logo.png",
      },
    },
    "mainEntityOfPage": {
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
