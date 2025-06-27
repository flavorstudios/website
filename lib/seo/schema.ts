// lib/seo/schema.ts

import { SITE_NAME, SITE_URL, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { getCanonicalUrl } from "./canonical"; // This helper is designed for RELATIVE paths

import type { WithContext, Thing, ImageObject, Organization } from "schema-dts"; // Import Organization type

const OG_IMAGE_DEFAULT_WIDTH = 1200;
const OG_IMAGE_DEFAULT_HEIGHT = 630;
const LOGO_DEFAULT_WIDTH = 600;
const LOGO_DEFAULT_HEIGHT = 60;

// Add optional caption/alt for legacy
type ImageObjectWithCaption = ImageObject & { caption?: string; alt?: string };

/**
 * Convert a relative URL to absolute, or return as-is if already absolute.
 * This function correctly canonicalizes a URL for Schema.org properties.
 * It checks if the input URL is already absolute (starts with http/https or //).
 * If it's absolute, it uses it as is. If it's relative, it uses getCanonicalUrl.
 */
export function getSchema<T extends Record<string, any>>({ // 'export' added for helper functions used directly in pages
  type = "WebPage",
  path = "/",
  title,
  description,
  image = SITE_DEFAULT_IMAGE,
  logoUrl = `${SITE_URL}/logo.png`, // Default logoUrl is already an absolute URL.
  organizationName = SITE_NAME,
  organizationUrl = SITE_URL, // Default organizationUrl is already an absolute URL.
  authorName,
  datePublished,
  dateModified,
  ...rest // Capture all other passed properties here (e.g., mainEntity, sameAs, thumbnailUrl, embedUrl)
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
} & T): WithContext<Thing> { // Add T to the intersection type
  const url = getCanonicalUrl(path); // Canonical URL for the page itself (path is always relative here, so getCanonicalUrl is perfect)

  // Process main image for schema (using 'caption' and absolute canonical URLs)
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

  // Process the organization logo for publisher (using 'caption' and absolute canonical URLs)
  const schemaLogo: ImageObject = {
    "@type": "ImageObject",
    url: getAbsoluteCanonicalUrlForSchema(logoUrl),
    width: LOGO_DEFAULT_WIDTH,
    height: LOGO_DEFAULT_HEIGHT,
    caption: `${organizationName} logo`,
  };

  // Define the publisher object (Organization).
  // This object will be added to schemas that require a publisher property.
  const publisherObject: Organization = {
    "@type": "Organization",
    name: organizationName,
    url: getAbsoluteCanonicalUrlForSchema(organizationUrl),
    logo: schemaLogo,
  };

  // Base schema properties that apply to most types.
  const baseSchema: Thing = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description: description,
    url: url,
    image: schemaImage,
    // CRITICAL FIX: Conditionally add 'publisher' only for schema types that are expected to have one.
    // An 'Organization' schema itself should NOT have a 'publisher' property.
    ...(type === "WebPage" || type === "Article" || type === "VideoObject" || type === "NewsArticle" || type === "BlogPosting" // Added BlogPosting
       ? { publisher: publisherObject }
       : {}),
    
    // Conditional properties specific to certain schema types.
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
      // Author property for Article schema (Person or Organization, handled by specific page)
      ...(authorName && {
        author: {
          "@type": "Person", // Default to Person, page should specify Organization if needed
          name: authorName,
        },
      }),
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
      headline: title, // Common Article property.
    }),
    // For other types (e.g., FAQPage, VideoObject), their specific properties like
    // 'mainEntity', 'thumbnailUrl', 'embedUrl', 'duration' will be spread from 'rest'.
  };

  // Merge base schema with all other properties captured by 'rest' parameter.
  // This allows direct passing of any other Schema.org properties from page level calls.
  return {
    ...baseSchema,
    ...rest, // This spreads all other properties directly into the schema.
  } as WithContext<Thing>;
}
