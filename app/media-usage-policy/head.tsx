export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Media Usage Policy",
            "url": "https://flavorstudios.in/media-usage-policy",
            "description":
              "Understand how you can use Flavor Studios' media assets, animations, and images. Review rules for personal, commercial, and editorial use, including attribution requirements.",
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
