import { SITE_NAME, SITE_URL } from "@/lib/constants";

const SOCIAL_LINKS = [
  "https://www.youtube.com/@flavorstudios",
  "https://www.instagram.com/flavorstudios",
  "https://twitter.com/flavor_studios",
  "https://www.facebook.com/flavourstudios",
  "https://www.threads.net/@flavorstudios",
  "https://discord.com/channels/@flavorstudios",
  "https://t.me/flavorstudios",
  "https://www.reddit.com/r/flavorstudios/",
  "https://bsky.app/profile/flavorstudios.bsky.social"
];

export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "DMCA Takedown Policy",
            "description":
              `Learn how to file a DMCA takedown notice with ${SITE_NAME}. Understand your rights and our copyright policy for protecting original content.`,
            "url": `${SITE_URL}/dmca`,
            "publisher": {
              "@type": "Organization",
              "name": SITE_NAME,
              "url": SITE_URL,
              "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`,
              },
              "sameAs": SOCIAL_LINKS,
            },
          }),
        }}
      />
    </>
  );
}
