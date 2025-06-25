import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      {/* Primary Meta Tags */}
      <title>Contact Flavor Studios – Collaborate or Inquire</title>
      <meta name="description" content="Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours." />
      <link rel="canonical" href="https://flavorstudios.in/contact" />
      <meta name="robots" content="index,follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content="Contact Flavor Studios – Collaborate or Inquire" />
      <meta property="og:description" content="Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://flavorstudios.in/contact" />
      <meta property="og:site_name" content="Flavor Studios" />
      <meta property="og:image" content="https://flavorstudios.in/cover.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flavorstudios" />
      <meta name="twitter:creator" content="@flavorstudios" />
      <meta name="twitter:title" content="Contact Flavor Studios – Collaborate or Inquire" />
      <meta name="twitter:description" content="Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours." />
      <meta name="twitter:image" content="https://flavorstudios.in/cover.jpg" />

      {/* JSON-LD Schema.org for ContactPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": `Contact ${SITE_NAME}`,
            "description":
              `Contact ${SITE_NAME} for support, collaborations, or inquiries. We typically respond within 24 to 48 hours.`,
            "url": `${SITE_URL}/contact`,
            "publisher": {
              "@type": "Organization",
              "name": SITE_NAME,
              "url": SITE_URL,
              "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`,
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "email": "contact@flavorstudios.in",
                  "contactType": "customer support",
                  "url": `${SITE_URL}/contact`,
                },
              ],
            },
          }),
        }}
      />
    </>
  );
}
