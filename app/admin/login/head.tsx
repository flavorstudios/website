export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Admin Login – Flavor Studios",
            "description": "Login securely to manage Flavor Studios content, blogs, and creative assets.",
            "url": "https://flavorstudios.in/admin/login",
            "applicationCategory": "AdministrativeApplication",
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
            }
          }),
        }}
      />
    </>
  );
}
