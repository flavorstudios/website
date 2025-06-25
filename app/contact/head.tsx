// app/contact/head.tsx

import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
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
