import { SITE_NAME, SITE_URL } from "@/lib/constants";

export default function Head() {
  return (
    <>
      {/* Primary Meta Tags */}
      <title>Flavor Studios Admin Dashboard</title>
      <meta name="description" content="Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard." />
      <link rel="canonical" href="https://flavorstudios.in/admin/dashboard" />
      <meta name="robots" content="noindex, nofollow" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content="Flavor Studios Admin Dashboard" />
      <meta property="og:description" content="Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://flavorstudios.in/admin/dashboard" />
      <meta property="og:site_name" content="Flavor Studios" />
      <meta property="og:image" content="https://flavorstudios.in/cover.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flavorstudios" />
      <meta name="twitter:creator" content="@flavorstudios" />
      <meta name="twitter:title" content="Flavor Studios Admin Dashboard" />
      <meta name="twitter:description" content="Access all admin tools to manage posts, videos, comments, and more for Flavor Studios from a single secure dashboard." />
      <meta name="twitter:image" content="https://flavorstudios.in/cover.jpg" />

      {/* JSON-LD Schema.org for WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `${SITE_NAME} Admin Dashboard`,
            description:
              `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
            url: `${SITE_URL}/admin/dashboard`,
            applicationCategory: "AdministrativeApplication",
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
            }
          }),
        }}
      />
    </>
  );
}
