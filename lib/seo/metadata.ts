// lib/seo/metadata.ts

import {
  SITE_NAME,
  SITE_URL,
  SITE_BRAND_TWITTER,
  SITE_DEFAULT_IMAGE,
} from "@/lib/constants";
import { getCanonicalUrl } from "./canonical";
import { WithContext, Thing } from "schema-dts";
import type { Metadata } from "next";

const DEFAULT_TITLE_SEPARATOR = "–";
const DEFAULT_TITLE_SUFFIX = `${DEFAULT_TITLE_SEPARATOR} ${SITE_NAME}`;
const OG_IMAGE_DEFAULT_WIDTH = 1200;
const OG_IMAGE_DEFAULT_HEIGHT = 630;

/**
 * SEO Metadata helper for Flavor Studios.
 * Supports title, description, canonical, Open Graph, Twitter, Schema, and robots meta.
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
  ogImage?: string | { url: string; width?: number; height?: number; alt?: string };
  schema?: WithContext<Thing>;
  robots?: string;
  openGraph?: Record<string, unknown>;
  twitter?: Record<string, unknown>;
}): Metadata {
  const fullTitle =
    title.trim().toLowerCase().includes(SITE_NAME.toLowerCase())
      ? title.trim()
      : `${title.trim()} ${DEFAULT_TITLE_SUFFIX}`;

  const canonical = getCanonicalUrl(path);

  const ogImagesArray: Array<{ url: string; width?: number; height?: number; alt?: string }> =
    typeof ogImage === "string"
      ? [{ url: ogImage, width: OG_IMAGE_DEFAULT_WIDTH, height: OG_IMAGE_DEFAULT_HEIGHT, alt: description }]
      : ogImage && typeof ogImage === "object" && "url" in ogImage
      ? [{
          url: ogImage.url,
          width: ogImage.width || OG_IMAGE_DEFAULT_WIDTH,
          height: ogImage.height || OG_IMAGE_DEFAULT_HEIGHT,
          alt: ogImage.alt || description,
        }]
      : [{
          url: SITE_DEFAULT_IMAGE,
          width: OG_IMAGE_DEFAULT_WIDTH,
          height: OG_IMAGE_DEFAULT_HEIGHT,
          alt: description,
        }];

  const defaultOpenGraph = {
    title: fullTitle,
    description,
    url: canonical,
    type: "website",
    siteName: SITE_NAME,
    images: ogImagesArray,
  };

  const defaultTwitter = {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: fullTitle,
    description,
    images: ogImagesArray.map((img) => img.url),
  };

  const mergedOpenGraph = {
    ...defaultOpenGraph,
    ...openGraph,
    siteName: SITE_NAME,
    url: canonical,
    images:
      Array.isArray((openGraph as Record<string, unknown>).images) && (openGraph as Record<string, unknown>).images.length > 0
        ? (openGraph as Record<string, { url: string; width?: number; height?: number; alt?: string }[]>).images.map(
            (img: { url: string; width?: number; height?: number; alt?: string }) => ({
              url: img.url,
              width: img.width || OG_IMAGE_DEFAULT_WIDTH,
              height: img.height || OG_IMAGE_DEFAULT_HEIGHT,
              alt: img.alt || description,
            })
          )
        : defaultOpenGraph.images,
  };

  const mergedTwitter = {
    ...defaultTwitter,
    ...twitter,
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    images:
      Array.isArray((twitter as Record<string, unknown>).images) && (twitter as Record<string, unknown>).images.length > 0
        ? (twitter as Record<string, (string | { url: string })[]>).images.map(
            (img: string | { url: string }) => (typeof img === "string" ? img : img.url)
          )
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
    ...(robots && { robots }),
    ...(schema && { schema }),
  } satisfies Metadata;
}
