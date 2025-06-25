import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      {/* JSON-LD Schema.org FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": `${SITE_NAME} FAQ`,
            "url": `${SITE_URL}/faq`,
            "description": `Find answers to common questions about ${SITE_NAME}, animation, support, and our creative process.`,
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is ${SITE_NAME}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${SITE_NAME} is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe.`,
                },
              },
              {
                "@type": "Question",
                "name": "Is my personal data protected?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used.",
                },
              },
              // ...add additional questions/answers as needed
            ],
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
