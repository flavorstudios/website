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
            "@type": "CollectionPage",
            "name": `Legal Policies, Privacy & Terms – ${SITE_NAME}`,
            "description":
              `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
            "url": `${SITE_URL}/legal`,
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
