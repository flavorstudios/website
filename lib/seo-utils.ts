// lib/seo-utils.ts

import {
  SITE_NAME,
  SITE_URL,
  SITE_BRAND_TWITTER,
  SITE_DEFAULT_IMAGE,
} from "@/lib/constants";

const BASE_URL = SITE_URL;
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
 * Accepts per-page openGraph and twitter overrides.
 */
export function getMetadata({
  title,
  description,
  path,
  ogImage = SITE_DEFAULT_IMAGE,
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
  const fullTitle =
    title.trim().toLowerCase().includes(SITE_NAME.toLowerCase())
      ? title.trim()
      : `${title} ${DEFAULT_TITLE_SUFFIX}`.replace(/ +/g, " ").trim();

  const canonical = getCanonicalUrl(path);

  const defaultOpenGraph = {
    title: fullTitle,
    description,
    url: canonical,
    type: "website",
    siteName: SITE_NAME, // ✅ fixed: siteName (camelCase) for Next.js compatibility
    images: [{ url: ogImage, width: 1200, height: 630 }],
  };

  const defaultTwitter = {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: fullTitle,
    description,
    images: [ogImage],
  };

  const mergedOpenGraph = {
    ...defaultOpenGraph,
    ...openGraph,
    siteName: SITE_NAME, // ✅ enforce correct case
    images:
      Array.isArray(openGraph.images) && openGraph.images.length > 0
        ? openGraph.images
        : defaultOpenGraph.images,
  };

  const mergedTwitter = {
    ...defaultTwitter,
    ...twitter,
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
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
