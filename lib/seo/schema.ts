// lib/seo/schema.ts



import { SITE_NAME, SITE_URL, SITE_DEFAULT_IMAGE } from "@/lib/constants";

import { getCanonicalUrl } from "./canonical";



import type { WithContext, Thing, ImageObject, Organization } from "schema-dts";



const OG_IMAGE_DEFAULT_WIDTH = 1200;

const OG_IMAGE_DEFAULT_HEIGHT = 630;

const LOGO_DEFAULT_WIDTH = 600;

const LOGO_DEFAULT_HEIGHT = 60;



// Add optional caption/alt for legacy

type ImageObjectWithCaption = ImageObject & { caption?: string; alt?: string };



/**

 * Convert a relative URL to absolute, or return as-is if already absolute.

 */

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

 * Generate Schema.org JSON-LD for any SEO context (WebPage, Article, FAQPage, VideoObject, etc.).

 * Accepts all schema.org fields as top-level properties.

 *

 * Pass any required property directly:

 *  - mainEntity, sameAs, thumbnailUrl, embedUrl, etc.

 *  - "publisher" is only included for WebPage, Article, VideoObject, NewsArticle, BlogPosting

 *

 * Example:

 *   getSchema({ type: "FAQPage", ..., mainEntity: [...] })

 *

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

  ...rest // Everything else passed at top level!

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



  // Construct main image object

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



  // Logo for publisher

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



  // Build base schema (conditionally add publisher only for correct types)

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

    ...(type === "Article" && {

      mainEntityOfPage: { "@type": "WebPage", "@id": url },

      ...(authorName && { author: { "@type": "Person", name: authorName } }),

      ...(datePublished && { datePublished }),

      ...(dateModified && { dateModified }),

      headline: title,

    }),

    // FAQPage, VideoObject, etc. fields are added below via ...rest

  };



  // Spread in ALL additional props: mainEntity, sameAs, thumbnailUrl, embedUrl, etc.

  return {

    ...baseSchema,

    ...rest,

  } as WithContext<Thing>;

}
