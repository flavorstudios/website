// lib/seo/schema.ts

import {
  SITE_NAME,
  SITE_URL,
  SITE_DEFAULT_IMAGE,
} from "@/lib/constants";
import { getCanonicalUrl } from "./canonical"; // Assuming your improved getCanonicalUrl

import type { WithContext, Thing, ImageObject } from "schema-dts";

const OG_IMAGE_DEFAULT_WIDTH = 1200;
const OG_IMAGE_DEFAULT_HEIGHT = 630;
const LOGO_DEFAULT_WIDTH = 600;
const LOGO_DEFAULT_HEIGHT = 60;

/**
 * JSON-LD structured data schema generator.
 * Provides a flexible way to generate various Schema.org types with common properties.
 *
 * @template T - Additional properties type.
 * @param {object} options - Options for schema generation.
 * @param {string} [options.type='WebPage'] - The Schema.org type (e.g., 'WebPage', 'Article', 'Product').
 * @param {string} [options.path='/'] - The path of the current page.
 * @param {string} options.title - The title of the page/entity.
 * @param {string} options.description - The description of the page/entity.
 * @param {string | Partial<ImageObject>} [options.image=SITE_DEFAULT_IMAGE] - The main image URL or an ImageObject.
 * @param {string} [options.logoUrl=`${SITE_URL}/logo.png`] - The URL for the organization's logo.
 * @param {string} [options.organizationName=SITE_NAME] - The name of the publishing organization.
 * @param {string} [options.organizationUrl=SITE_URL] - The URL of the publishing organization.
 * @param {string} [options.authorName] - The name of the author (useful for Article type).
 * @param {string} [options.datePublished] - The publication date (ISO 8601 string, useful for Article type).
 * @param {string} [options.dateModified] - The last modified date (ISO 8601 string, useful for Article type).
 * @param {T} [options.additionalProperties={}] - Any additional properties specific to the schema type.
 * @returns {WithContext<Thing>} The generated JSON-LD schema object.
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
  authorName, // New: For Article type
  datePublished, // New: For Article type
  dateModified, // New: For Article type
  additionalProperties = {},
}: {
  type?: string;
  path?: string;
  title: string;
  description: string;
  image?: string | Partial<ImageObject>; // Use Partial<ImageObject> from schema-dts
  logoUrl?: string;
  organizationName?: string;
  organizationUrl?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
  additionalProperties?: T;
}): WithContext<Thing> {
  const url = getCanonicalUrl(path);

  // 1. Process the main image for schema
  let schemaImage: ImageObject;
  if (typeof image === 'string') {
    schemaImage = {
      "@type": "ImageObject",
      url: image,
      width: OG_IMAGE_DEFAULT_WIDTH,
      height: OG_IMAGE_DEFAULT_HEIGHT,
      alt: description, // Fallback alt text
    };
  } else {
    schemaImage = {
      "@type": "ImageObject", // Ensure type is set even if partially provided
      ...image,
      url: image.url, // URL is mandatory
      width: image.width || OG_IMAGE_DEFAULT_WIDTH,
      height: image.height || OG_IMAGE_DEFAULT_HEIGHT,
      alt: image.alt || description, // Use description as fallback
    };
  }

  // 2. Process the organization logo for schema
  const schemaLogo: ImageObject = {
    "@type": "ImageObject",
    url: logoUrl,
    width: LOGO_DEFAULT_WIDTH, // Fixed width for consistency
    height: LOGO_DEFAULT_HEIGHT, // Fixed height for consistency
    alt: `${organizationName} logo`, // Good alt text for logo
  };

  const baseSchema: Thing = { // Explicitly type baseSchema as Thing
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description,
    url,
    image: schemaImage,
    publisher: {
      "@type": "Organization",
      name: organizationName,
      url: organizationUrl,
      logo: schemaLogo,
    },
  };

  // 3. Conditional properties based on type (more specific)
  if (type === "WebPage") {
    // Add WebPage specific properties, often just mainEntityOfPage
    Object.assign(baseSchema, {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    });
  } else if (type === "Article") {
    // Article schema requires more details like author and dates
    Object.assign(baseSchema, {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      ...(authorName && {
        author: {
          "@type": "Person", // Assuming author is a person
          name: authorName,
        },
      }),
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
      // Consider adding potential headline, articleBody, etc. depending on depth needed
      // headline: title, // Often matches the page title
      // articleBody: description, // Or actual article content snippet
    });
  }
  // Add more `else if` blocks for other specific types like 'Product', 'Event', etc.
  // if (type === "Product") { /* add product specific schema */ }

  // 4. Merge additionalProperties last to allow full override
  return {
    ...baseSchema,
    ...additionalProperties,
  } as WithContext<Thing>; // Cast to WithContext<Thing> for final return
}
