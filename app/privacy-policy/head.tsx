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
            name: "Privacy Policy",
            description:
              `Read how ${SITE_NAME} collects, uses, and safeguards your personal data while using ${SITE_URL}. Your privacy matters to us.`,
            url: `${SITE_URL}/privacy-policy`,
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
