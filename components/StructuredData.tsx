// components/StructuredData.tsx

type StructuredDataProps = {
  schema: Record<string, any>;
};

export function StructuredData({ schema }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
