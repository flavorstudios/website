import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    description: `Explore the heart and vision of ${SITE_NAME} — an indie animation studio crafting emotionally rich anime and 3D stories powered by creativity and community.`,
    url: `${SITE_URL}/about`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
