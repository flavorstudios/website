export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Flavor Studios",
            "description":
              "Explore the heart and vision of Flavor Studios — an indie animation studio crafting emotionally rich anime and 3D stories powered by creativity and community.",
            "url": "https://flavorstudios.in/about",
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
