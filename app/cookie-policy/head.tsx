import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Cookie Policy",
            description:
              `Understand how ${SITE_NAME} uses cookies to enhance your experience. Read our cookie policy to control your privacy settings on ${SITE_URL.replace(/^https?:\/\//, '')}.`,
            url: `${SITE_URL}/cookie-policy`,
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo.png`,
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
            },
          }),
        }}
      />
    </>
  );
}
