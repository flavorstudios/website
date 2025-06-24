// lib/seo-utils.ts

import { SITE_NAME, SITE_URL } from "@/lib/constants";

const BASE_URL = SITE_URL;
const DEFAULT_OG_IMAGE = `${BASE_URL}/cover.jpg`;
const DEFAULT_TITLE_SUFFIX = `– ${SITE_NAME}`;

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
  // Suffix with "– Flavor Studios" if not present at the end
  const fullTitle =
    title.trim().toLowerCase().includes(SITE_NAME.toLowerCase())
      ? title.trim()
      : `${title} ${DEFAULT_TITLE_SUFFIX}`.replace(/ +/g, " ").trim();

  const canonical = getCanonicalUrl(path);

  // Defaults (OG, Twitter)
  const defaultOpenGraph = {
    title: fullTitle,
    description,
    url: canonical,
    type: "website",
    site_name: SITE_NAME,
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

  // Merge Open Graph and always force site_name to SITE_NAME
  const mergedOpenGraph = {
    ...defaultOpenGraph,
    ...openGraph,
    site_name: SITE_NAME, // <-- Hard enforced, never overwritten
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
    robots,
    ...(schema && { schema }),
  };
}
