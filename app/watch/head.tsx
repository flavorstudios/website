import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${SITE_NAME} Videos`,
          description:
            `Watch original anime, studio films, and exclusive video content from ${SITE_NAME}. Discover our creative world—stream the latest now.`,
          url: `${SITE_URL}/watch`,
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/logo.png`,
            },
          },
        }),
      }}
    />
  );
}
