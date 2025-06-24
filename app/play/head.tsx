export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Play Games",
            "url": "https://flavorstudios.in/play",
            "description":
              "Enjoy interactive games including Tic-Tac-Toe with AI and multiplayer options on Flavor Studios. Experience classic fun with a modern twist.",
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
