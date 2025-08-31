import { SITE_NAME, SITE_URL, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { getCanonicalUrl } from "./canonical";
import type { WithContext, Thing, ImageObject, Organization } from "schema-dts";

const OG_IMAGE_DEFAULT_WIDTH = "1200";
const OG_IMAGE_DEFAULT_HEIGHT = "630";
const LOGO_DEFAULT_WIDTH = "600";
const LOGO_DEFAULT_HEIGHT = "60";

type ImageObjectWithCaption = ImageObject & { caption?: string; alt?: string };
type SchemaType = Extract<Thing, { "@type": any }>["@type"];

// Always return an absolute canonical URL for schema fields.
function getAbsoluteCanonicalUrlForSchema(inputUrl: string): string {
  if (typeof inputUrl !== "string") {
    return String(inputUrl);
  }
  if (
    inputUrl.startsWith("http://") ||
    inputUrl.startsWith("https://") ||
    inputUrl.startsWith("//")
  ) {
    return inputUrl;
  }
  return getCanonicalUrl(inputUrl);
}

// Helper to extract url (string) from unknown types
function extractUrl(url: unknown): string {
  if (!url) return SITE_DEFAULT_IMAGE;
  if (typeof url === "string") return url;
  if (typeof url === "object" && url !== null && "@id" in url) {
    return String((url as Record<string, unknown>)["@id"]);
  }
  return String(url);
}

// Accepts a generic T for extra properties
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
  ...rest
}: {
  type?: "WebPage" | "Article" | "VideoObject" | "NewsArticle" | "BlogPosting" | "FAQPage" | "CollectionPage" | "Organization" | "ImageObject" | string;
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

  // --- Schema image ---
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
      url: getAbsoluteCanonicalUrlForSchema(extractUrl(img.url)),
      width: img.width ? String(img.width) : OG_IMAGE_DEFAULT_WIDTH,
      height: img.height ? String(img.height) : OG_IMAGE_DEFAULT_HEIGHT,
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

  // --- Schema logo ---
  const schemaLogo: ImageObject = {
    "@type": "ImageObject",
    url: getAbsoluteCanonicalUrlForSchema(logoUrl),
    width: LOGO_DEFAULT_WIDTH,
    height: LOGO_DEFAULT_HEIGHT,
    caption: `${organizationName} logo`,
  };

  // --- Publisher object ---
  const publisherObject: Organization = {
    "@type": "Organization",
    name: organizationName,
    url: getAbsoluteCanonicalUrlForSchema(organizationUrl),
    logo: schemaLogo,
  };

  // --- Base schema object ---
  const baseSchema: Partial<Thing> = {
    "@type": type as SchemaType,
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
  };

  // Merge with additional fields in a type-safe way (TS strict mode happy!)
  return {
    ...baseSchema,
    ...(rest && typeof rest === "object" ? rest : {}),
  } as WithContext<Thing>;
}
