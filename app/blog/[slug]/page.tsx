export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found – Flavor Studios",
      description: "This blog post could not be found.",
      alternates: {
        canonical: `https://flavorstudios.in/blog/${params.slug}`,
      },
    };
  }

  const canonicalUrl = `https://flavorstudios.in/blog/${post.slug}`;
  const ogImage = post.coverImage || "https://flavorstudios.in/cover.jpg";
  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.excerpt;

  return {
    title: `${seoTitle} – Flavor Studios`,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@flavor_studios",
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
  };
}
