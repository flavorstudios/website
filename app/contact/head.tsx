export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Flavor Studios",
            "description":
              "Contact Flavor Studios for support, collaborations, or inquiries. We typically respond within 24 to 48 hours.",
            "url": "https://flavorstudios.in/contact",
            "publisher": {
              "@type": "Organization",
              "name": "Flavor Studios",
              "url": "https://flavorstudios.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://flavorstudios.in/logo.png",
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "email": "contact@flavorstudios.in",
                  "contactType": "customer support",
                  "url": "https://flavorstudios.in/contact",
                },
              ],
            },
          }),
        }}
      />
    </>
  );
}
