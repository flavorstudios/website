// lib/seo/schema.ts

import { SITE_NAME, SITE_URL, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { getCanonicalUrl } from "./canonical";
import type { WithContext, Thing, ImageObject } from "schema-dts";

const OG_IMAGE_DEFAULT_WIDTH = 1200;
const OG_IMAGE_DEFAULT_HEIGHT = 630;
const LOGO_DEFAULT_WIDTH = 600;
const LOGO_DEFAULT_HEIGHT = 60;

// Extend ImageObject to optionally include caption/alt for legacy compatibility
type ImageObjectWithCaption = ImageObject & { caption?: string; alt?: string };

/**
 * Generate Schema.org JSON-LD for any SEO context (WebPage, Article, etc.)
 * @template T Additional schema.org properties
 * @returns {WithContext<Thing>} JSON-LD schema object
 */
export function getSchema<T extends Record<string, any>>({
  type = "WebPage",
  path = "/",
  title,
  description,
  image = SITE_DEFAULT_IMAGE,
  logoUrl = `${SITE_URL}/logo.png`,
  organizationName = SITE_NAME,
  organizationUrl = SITE_URL,
  authorName,
  datePublished,
  dateModified,
  additionalProperties = {},
}: {
  type?: string;
  path?: string;
  title: string;
  description: string;
  image?: string | Partial<ImageObjectWithCaption>;
  logoUrl?: string;
  organizationName?: string;
  organizationUrl?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
  additionalProperties?: T;
}): WithContext<Thing> {
  // Canonical URL for the page
  const url = getCanonicalUrl(path);

  // Canonicalize image
  let schemaImage: ImageObject;
  if (typeof image === "string") {
    schemaImage = {
      "@type": "ImageObject",
      url: getCanonicalUrl(image),
      width: OG_IMAGE_DEFAULT_WIDTH,
      height: OG_IMAGE_DEFAULT_HEIGHT,
      caption: description,
    };
  } else if (typeof image === "object" && image !== null && "url" in image) {
    const img = image as Partial<ImageObjectWithCaption>;
    schemaImage = {
      "@type": "ImageObject",
      url: getCanonicalUrl(img.url!),
      width: img.width || OG_IMAGE_DEFAULT_WIDTH,
      height: img.height || OG_IMAGE_DEFAULT_HEIGHT,
      caption: img.caption || img.alt || description,
    };
  } else {
    schemaImage = {
      "@type": "ImageObject",
      url: getCanonicalUrl(SITE_DEFAULT_IMAGE),
      width: OG_IMAGE_DEFAULT_WIDTH,
      height: OG_IMAGE_DEFAULT_HEIGHT,
      caption: description,
    };
  }

  // Canonicalize logo
  const schemaLogo: ImageObject = {
    "@type": "ImageObject",
    url: getCanonicalUrl(logoUrl),
    width: LOGO_DEFAULT_WIDTH,
    height: LOGO_DEFAULT_HEIGHT,
    caption: `${organizationName} logo`,
  };

  // Base schema object (merge additionalProperties last for full override)
  const baseSchema: Thing = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description,
    url,
    image: schemaImage,
    publisher: {
      "@type": "Organization",
      name: organizationName,
      url: getCanonicalUrl(organizationUrl),
      logo: schemaLogo,
    },
    ...(type === "WebPage" && {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    }),
    ...(type === "Article" && {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      ...(authorName && {
        author: {
          "@type": "Person",
          name: authorName,
        },
      }),
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
      headline: title,
      // You may also add: articleBody, wordCount, etc.
    }),
    // Extend for Product, FAQPage, VideoObject, etc. as needed
  };

  // Return as a schema.org WithContext object
  return {
    ...baseSchema,
    ...additionalProperties,
  } as WithContext<Thing>;
}
