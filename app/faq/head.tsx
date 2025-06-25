import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      {/* Primary Meta Tags */}
      <title>Flavor Studios FAQ – Anime & Support Help</title>
      <meta name="description" content="Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories." />
      <link rel="canonical" href="https://flavorstudios.in/faq" />
      <meta name="robots" content="index,follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content="Flavor Studios FAQ – Anime & Support Help" />
      <meta property="og:description" content="Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://flavorstudios.in/faq" />
      <meta property="og:site_name" content="Flavor Studios" />
      <meta property="og:image" content="https://flavorstudios.in/cover.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flavorstudios" />
      <meta name="twitter:creator" content="@flavorstudios" />
      <meta name="twitter:title" content="Flavor Studios FAQ – Anime & Support Help" />
      <meta name="twitter:description" content="Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories." />
      <meta name="twitter:image" content="https://flavorstudios.in/cover.jpg" />

      {/* JSON-LD Schema.org for FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": `${SITE_NAME} FAQ`,
            "url": `${SITE_URL}/faq`,
            "description":
              `Find answers to common questions about ${SITE_NAME}, animation, support, and our creative process.`,
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is ${SITE_NAME}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${SITE_NAME} is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe.`,
                },
              },
              // ... Add all other FAQ entries here
              {
                "@type": "Question",
                "name": "Is my personal data protected?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used.",
                },
              },
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
