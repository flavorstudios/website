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
            "name": "Play Games",
            "url": `${SITE_URL}/play`,
            "description":
              `Enjoy interactive games including Tic-Tac-Toe with AI and multiplayer options on ${SITE_NAME}. Experience classic fun with a modern twist.`,
            "publisher": {
              "@type": "Organization",
              "name": SITE_NAME,
              "url": SITE_URL,
              "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`,
              },
            },
          }),
        }}
      />
    </>
  );
}
