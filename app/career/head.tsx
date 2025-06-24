export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Careers at Flavor Studios",
            "description":
              "Discover animation, writing, and voice acting opportunities at Flavor Studios. Join our talent list and be part of something original.",
            "url": "https://flavorstudios.in/career",
            "publisher": {
              "@type": "Organization",
              "name": "Flavor Studios",
              "url": "https://flavorstudios.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://flavorstudios.in/logo.png",
              },
            },
          }),
        }}
      />
    </>
  );
}
