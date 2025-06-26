import {
  SITE_NAME,
  SITE_URL, // Though SITE_URL is used by getCanonicalUrl, it's good to have it here if needed for other metadata parts.
  SITE_BRAND_TWITTER,
  SITE_DEFAULT_IMAGE,
} from "@/lib/constants";
import { getCanonicalUrl } from "./canonical"; // Assuming the improved getCanonicalUrl is used

const DEFAULT_TITLE_SEPARATOR = "–"; // Use a constant for separator for consistency
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
  ogImage = SITE_DEFAULT_IMAGE, // Renamed to defaultOgImage for clarity if a custom one is passed
  schema,
  robots,
  openGraph = {},
  twitter = {},
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string | { url: string; width?: number; height?: number; alt?: string; }; // Allow object for more control
  schema?: object; // Consider using a more specific type like `SchemaOrg` if available
  robots?: string;
  openGraph?: Record<string, any>;
  twitter?: Record<string, any>;
}) {
  // 1. Title Generation: More robust checking and trimming
  const fullTitle =
    title.trim().toLowerCase().includes(SITE_NAME.toLowerCase())
      ? title.trim() // If site name is already in title, just trim it
      : `${title.trim()} ${DEFAULT_TITLE_SUFFIX}`; // Add suffix and then trim any extra spaces

  // 2. Canonical URL: Directly uses the helper
  const canonical = getCanonicalUrl(path);

  // 3. Open Graph Image Handling: More flexible with object type
  let ogImagesArray: Array<{ url: string; width?: number; height?: number; alt?: string; }>;

  if (typeof ogImage === 'string') {
    ogImagesArray = [{ url: ogImage, width: OG_IMAGE_DEFAULT_WIDTH, height: OG_IMAGE_DEFAULT_HEIGHT }];
  } else if (typeof ogImage === 'object' && ogImage !== null && 'url' in ogImage) {
    ogImagesArray = [{
      url: ogImage.url,
      width: ogImage.width || OG_IMAGE_DEFAULT_WIDTH,
      height: ogImage.height || OG_IMAGE_DEFAULT_HEIGHT,
      alt: ogImage.alt || description, // Use description as fallback for alt text
    }];
  } else {
    // Fallback to SITE_DEFAULT_IMAGE if ogImage is somehow invalid
    ogImagesArray = [{ url: SITE_DEFAULT_IMAGE, width: OG_IMAGE_DEFAULT_WIDTH, height: OG_IMAGE_DEFAULT_HEIGHT }];
  }

  // 4. Default Open Graph Data
  const defaultOpenGraph = {
    title: fullTitle,
    description: description, // Ensure description is always present
    url: canonical,
    type: "website",
    siteName: SITE_NAME,
    images: ogImagesArray, // Use the processed image array
  };

  // 5. Default Twitter Data
  const defaultTwitter = {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER, // Your brand's Twitter handle
    creator: SITE_BRAND_TWITTER, // The content creator's Twitter handle (can be same as site)
    title: fullTitle,
    description: description, // Ensure description is always present
    images: ogImagesArray.map(img => img.url), // Twitter images typically just need the URL
  };

  // 6. Merge Open Graph Data
  const mergedOpenGraph = {
    ...defaultOpenGraph,
    ...openGraph,
    // Ensure siteName and url are not overridden by passed openGraph if they are critical
    siteName: SITE_NAME,
    url: canonical,
    // Handle images explicitly to allow overriding but provide defaults
    images:
      Array.isArray(openGraph.images) && openGraph.images.length > 0
        ? openGraph.images.map((img: any) => ({
            url: img.url,
            width: img.width || OG_IMAGE_DEFAULT_WIDTH,
            height: img.height || OG_IMAGE_DEFAULT_HEIGHT,
            alt: img.alt || description,
          })) // Map to ensure consistent structure
        : defaultOpenGraph.images,
  };

  // 7. Merge Twitter Data
  const mergedTwitter = {
    ...defaultTwitter,
    ...twitter,
    // Ensure site and creator are not overridden if they are critical
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    // Handle images explicitly
    images:
      Array.isArray(twitter.images) && twitter.images.length > 0
        ? twitter.images.map((img: any) => typeof img === 'string' ? img : img.url) // Map to get just URLs if objects are passed
        : defaultTwitter.images,
  };

  // 8. Return final metadata object
  return {
    title: fullTitle,
    description: description,
    alternates: {
      canonical,
    },
    openGraph: mergedOpenGraph,
    twitter: mergedTwitter,
    ...(robots && { robots }), // Only include robots if provided
    ...(schema && { schema }), // Only include schema if provided
  };
}
