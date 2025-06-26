// components/StructuredData.tsx

import { WithContext, Thing } from "schema-dts";

interface StructuredDataProps {
  schema: WithContext<Thing>;
}

/**
 * Reusable component to inject JSON-LD structured data into the HTML.
 * Renders a <script type="application/ld+json"> tag.
 * Next.js will move this to the <head> during server-side rendering.
 */
export function StructuredData({ schema }: StructuredDataProps) {
  // Ensure the schema object is not empty or null before stringifying
  if (!schema || Object.keys(schema).length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      // suppressHydrationWarning is important here to prevent React hydration mismatches,
      // which are common and safe for static script tags like JSON-LD.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
