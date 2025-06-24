export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Legal Policies, Privacy & Terms – Flavor Studios",
            "description":
              "Access all Flavor Studios legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.",
            "url": "https://flavorstudios.in/legal",
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
                "https://bsky.app/profile/flavorstudios.bsky.social",
              ],
            },
          }),
        }}
      />
    </>
  );
}
