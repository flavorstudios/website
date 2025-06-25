import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      {/* Primary Meta Tags */}
      <title>Play Anime-Inspired Games Online | {SITE_NAME}</title>
      <meta name="description" content="Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on {SITE_NAME}." />
      <link rel="canonical" href={`${SITE_URL}/play`} />
      <meta name="robots" content="index,follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={`Play Anime-Inspired Games Online | ${SITE_NAME}`} />
      <meta property="og:description" content="Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on {SITE_NAME}." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/play`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={`${SITE_URL}/cover.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flavorstudios" />
      <meta name="twitter:creator" content="@flavorstudios" />
      <meta name="twitter:title" content={`Play Anime-Inspired Games Online | ${SITE_NAME}`} />
      <meta name="twitter:description" content="Play fun, anime-inspired games like Tic-Tac-Toe and more. Challenge our AI or your friends in multiple modes—only on {SITE_NAME}." />
      <meta name="twitter:image" content={`${SITE_URL}/cover.jpg`} />

      {/* JSON-LD Schema.org for Play Page */}
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
