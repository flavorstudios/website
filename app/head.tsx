// app/head.tsx

export default function Head() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flavor Studios",
    url: "https://flavorstudios.in/",
    description:
      "Flavor Studios brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.",
    logo: {
      "@type": "ImageObject",
      url: "https://flavorstudios.in/logo.png",
    },
    sameAs: [
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
