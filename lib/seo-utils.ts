const BASE_URL = "https://flavorstudios.in";
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`;
const DEFAULT_TITLE_SUFFIX = "– Flavor Studios";

export function getCanonicalUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/**
 * SEO Metadata helper for Flavor Studios.
 * Supports title, description, canonical, Open Graph, Twitter, Schema, and robots meta.
 * Now accepts per-page openGraph and twitter overrides!
 */
export function getMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  robots,
  openGraph = {},
  twitter = {},
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  schema?: object;
  robots?: string;
  openGraph?: Record<string, any>;
  twitter?: Record<string, any>;
}) {
  const fullTitle = `${title} ${DEFAULT_TITLE_SUFFIX}`;
  const canonical = getCanonicalUrl(path);

  // Prepare additional meta fields (robots, schema)
  const other: Array<{ property: string; content: string }> = [];
  if (robots) {
    other.push({ property: "robots", content: robots });
  }

  // Default Open Graph data
  const defaultOpenGraph = {
    title: fullTitle,
    description,
    url: canonical,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630 }],
  };

  // Default Twitter data
  const defaultTwitter = {
    card: "summary_large_image",
    site: "@flavorstudios",
    title: fullTitle,
    description,
    images: [ogImage],
  };

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      ...defaultOpenGraph,
      ...openGraph, // Allow per-page overrides
      images: openGraph.images || defaultOpenGraph.images,
    },
    twitter: {
      ...defaultTwitter,
      ...twitter, // Allow per-page overrides
      images: twitter.images || defaultTwitter.images,
    },
    // Next.js v13+ supports an 'other' array for custom meta properties
    other,
    // Optionally add schema as needed
    ...(schema && { schema }),
  };
}
