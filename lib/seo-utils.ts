const BASE_URL = "https://flavorstudios.in";
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`;
const DEFAULT_TITLE_SUFFIX = "– Flavor Studios";

/**
 * Returns a canonical, SEO-optimized URL for any path.
 */
export function getCanonicalUrl(path: string): string {
  // Ensure leading slash, no trailing slash except for root
  if (!path.startsWith("/")) path = "/" + path;
  return `${BASE_URL}${path === "/" ? "" : path.replace(/\/$/, "")}`;
}

/**
 * SEO Metadata helper for Flavor Studios.
 * Supports title, description, canonical, Open Graph, Twitter, Schema, and robots meta.
 * Accepts per-page openGraph and twitter overrides (images always correct format).
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
  // Append suffix unless already present (avoid "Flavor Studios – Flavor Studios")
  const fullTitle =
    title.includes("Flavor Studios") ||
    title.includes("Flavor Studios".toLowerCase())
      ? title.trim()
      : `${title} ${DEFAULT_TITLE_SUFFIX}`.replace(/ +/g, " ").trim();

  const canonical = getCanonicalUrl(path);

  // Prepare additional meta fields (robots, schema)
  const other: Record<string, string>[] = [];
  if (robots) {
    other.push({ name: "robots", content: robots });
  }

  // Default Open Graph data
  const defaultOpenGraph = {
    title: fullTitle,
    description,
    url: canonical,
    type: "website",
    site_name: "Flavor Studios",
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

  // Merge, always enforce array for images
  const mergedOpenGraph = {
    ...defaultOpenGraph,
    ...openGraph,
    images:
      Array.isArray(openGraph.images) && openGraph.images.length > 0
        ? openGraph.images
        : defaultOpenGraph.images,
  };

  const mergedTwitter = {
    ...defaultTwitter,
    ...twitter,
    images:
      Array.isArray(twitter.images) && twitter.images.length > 0
        ? twitter.images
        : defaultTwitter.images,
  };

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: mergedOpenGraph,
    twitter: mergedTwitter,
    other,
    ...(schema && { schema }),
  };
}
