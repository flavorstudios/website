const BASE_URL = "https://flavorstudios.in";
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`;
const DEFAULT_TITLE_SUFFIX = "– Flavor Studios";

/**
 * Returns a canonical, SEO-optimized URL for any path.
 */
export function getCanonicalUrl(path: string): string {
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
  // Suffix "– Flavor Studios" if not present at the end (avoiding double/awkward titles)
  const fullTitle =
    title.trim().toLowerCase().includes("flavor studios")
      ? title.trim()
      : `${title} ${DEFAULT_TITLE_SUFFIX}`.replace(/ +/g, " ").trim();

  const canonical = getCanonicalUrl(path);

  // Defaults (OG, Twitter)
  const defaultOpenGraph = {
    title: fullTitle,
    description,
    url: canonical,
    type: "website",
    site_name: "Flavor Studios",
    images: [{ url: ogImage, width: 1200, height: 630 }],
  };

  const defaultTwitter = {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: fullTitle,
    description,
    images: [ogImage],
  };

  // Merge Open Graph and always force site_name to "Flavor Studios"
  const mergedOpenGraph = {
    ...defaultOpenGraph,
    ...openGraph,
    site_name: "Flavor Studios", // <-- Hard enforced, never overwritten
    images:
      Array.isArray(openGraph.images) && openGraph.images.length > 0
        ? openGraph.images
        : defaultOpenGraph.images,
  };

  // Merge Twitter and always force site/creator to @flavorstudios
  const mergedTwitter = {
    ...defaultTwitter,
    ...twitter,
    site: "@flavorstudios",
    creator: "@flavorstudios",
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
    robots, // ✅ Official Next.js field (replaces earlier `other.push`)
    ...(schema && { schema }), // ✅ Still passed for layout to inject (but not exported in metadata)
  };
}
