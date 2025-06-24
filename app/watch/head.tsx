export default function Head() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Flavor Studios Videos",
          description:
            "Watch original anime, studio films, and exclusive video content from Flavor Studios. Discover our creative world—stream the latest now.",
          url: "https://flavorstudios.in/watch",
          publisher: {
            "@type": "Organization",
            name: "Flavor Studios",
            url: "https://flavorstudios.in",
            logo: {
              "@type": "ImageObject",
              url: "https://flavorstudios.in/logo.png",
            },
          },
        }),
      }}
    />
  );
}
