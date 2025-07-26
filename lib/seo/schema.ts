// lib/seo/schema.ts

import { SITE_NAME, SITE_URL, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { getCanonicalUrl } from "./canonical";
import type { WithContext, Thing, ImageObject, Organization } from "schema-dts";

const OG_IMAGE_DEFAULT_WIDTH = 1200;
const OG_IMAGE_DEFAULT_HEIGHT = 630;
const LOGO_DEFAULT_WIDTH = 600;
const LOGO_DEFAULT_HEIGHT = 60;

// Allow alt/caption for legacy SEO (optional)
type ImageObjectWithCaption = ImageObject & { caption?: string; alt?: string };

/** Ensures all schema.org URLs are absolute */
function getAbsoluteCanonicalUrlForSchema(inputUrl: string): string {
  if (
    inputUrl.startsWith("http://") ||
    inputUrl.startsWith("https://") ||
    inputUrl.startsWith("//")
  ) {
    return inputUrl;
  }
  return getCanonicalUrl(inputUrl);
}

/**
 * Universal Schema.org JSON-LD generator for any context
 * Usage:
 *   getSchema({ type: "Blog", ...props })
 */
export function getSchema<T extends Record<string, unknown>>({
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
  ...rest // Everything else (mainEntity, sameAs, etc)
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
} & T): WithContext<Thing> {
  const url = getCanonicalUrl(path);

  // Main image
  let schemaImage: ImageObject;
  if (typeof image === "string") {
    schemaImage = {
      "@type": "ImageObject",
      url: getAbsoluteCanonicalUrlForSchema(image),
      width: OG_IMAGE_DEFAULT_WIDTH,
      height: OG_IMAGE_DEFAULT_HEIGHT,
      caption: description,
    };
  } else if (typeof image === "object" && image !== null && "url" in image) {
    const img = image as Partial<ImageObjectWithCaption>;
    schemaImage = {
      "@type": "ImageObject",
      url: getAbsoluteCanonicalUrlForSchema(img.url!),
      width: img.width || OG_IMAGE_DEFAULT_WIDTH,
      height: img.height || OG_IMAGE_DEFAULT_HEIGHT,
      caption: img.caption || img.alt || description,
    };
  } else {
    schemaImage = {
      "@type": "ImageObject",
      url: getAbsoluteCanonicalUrlForSchema(SITE_DEFAULT_IMAGE),
      width: OG_IMAGE_DEFAULT_WIDTH,
      height: OG_IMAGE_DEFAULT_HEIGHT,
      caption: description,
    };
  }

  // Logo for publisher (always absolute)
  const schemaLogo: ImageObject = {
    "@type": "ImageObject",
    url: getAbsoluteCanonicalUrlForSchema(logoUrl),
    width: LOGO_DEFAULT_WIDTH,
    height: LOGO_DEFAULT_HEIGHT,
    caption: `${organizationName} logo`,
  };

  // Publisher object
  const publisherObject: Organization = {
    "@type": "Organization",
    name: organizationName,
    url: getAbsoluteCanonicalUrlForSchema(organizationUrl),
    logo: schemaLogo,
  };

  // Base schema object
  const baseSchema: Thing = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description,
    url,
    image: schemaImage,
    ...( // Only for types that expect publisher
      ["WebPage", "Article", "VideoObject", "NewsArticle", "BlogPosting"].includes(type)
        ? { publisher: publisherObject }
        : {}
    ),
    ...(type === "WebPage" && {
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    }),
    ...(type === "Article" || type === "BlogPosting"
      ? {
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          ...(authorName && { author: { "@type": "Person", name: authorName } }),
          ...(datePublished && { datePublished }),
          ...(dateModified && { dateModified }),
          headline: title,
        }
      : {}),
    // FAQPage, VideoObject, etc: ...rest below
  };

  // Spread all additional fields
  return {
    ...baseSchema,
    ...rest,
  } as WithContext<Thing>;
}
