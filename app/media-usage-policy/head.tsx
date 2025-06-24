import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Media Usage Policy",
            url: `${SITE_URL}/media-usage-policy`,
            description:
              `Understand how you can use ${SITE_NAME}' media assets, animations, and images. Review rules for personal, commercial, and editorial use, including attribution requirements.`,
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
    </>
  );
}
