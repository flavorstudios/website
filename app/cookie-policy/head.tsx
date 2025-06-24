export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Cookie Policy",
            "description":
              "Understand how Flavor Studios uses cookies to enhance your experience. Read our cookie policy to control your privacy settings on flavorstudios.in.",
            "url": "https://flavorstudios.in/cookie-policy",
            "publisher": {
              "@type": "Organization",
              "name": "Flavor Studios",
              "url": "https://flavorstudios.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://flavorstudios.in/logo.png",
              },
              "sameAs": [
                "https://www.youtube.com/@flavorstudios",
                "https://www.instagram.com/flavorstudios",
                "https://twitter.com/flavor_studios",
                "https://www.facebook.com/flavourstudios",
                "https://www.threads.net/@flavorstudios",
                "https://discord.com/channels/@flavorstudios",
                "https://t.me/flavorstudios",
                "https://www.reddit.com/r/flavorstudios/",
                "https://bsky.app/profile/flavorstudios.bsky.social"
              ]
            },
          }),
        }}
      />
    </>
  );
}
