// app/head.tsx

import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL + "/",
    description:
      "Flavor Studios brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.",
    logo: {
      "@type": "ImageObject",
      url: SITE_URL + "/logo.png",
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
      {/* === Favicon === */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />

      {/* === PWA Manifest & Theme === */}
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="theme-color" content="#000000" />

      {/* === Apple PWA Support === */}
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />

      {/* === Facebook Open Graph App ID === */}
      <meta property="fb:app_id" content="1404440770881914" />

      {/* === Mastodon Verification === */}
      <link rel="me" href="https://mastodon.social/@flavorstudios" />

      {/* === Open Graph Site Name (fixes og:site_name not provided) === */}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* === JSON-LD Schema === */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {/* === Google Tag Manager (HEAD) === */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WMTGR7NM');
          `,
        }}
      />
      {/* === END GTM (HEAD) === */}
    </>
  );
}
