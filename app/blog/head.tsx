import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": `${SITE_NAME} Blog`,
            "description":
              `Explore the latest anime news, creative industry insights, and original studio stories from ${SITE_NAME}. Go behind the scenes with our team.`,
            "url": `${SITE_URL}/blog`,
            "publisher": {
              "@type": "Organization",
              "name": SITE_NAME,
              "url": SITE_URL,
              "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`,
              },
            },
          }),
        }}
      />
    </>
  );
}
