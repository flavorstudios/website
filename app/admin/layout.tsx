import type React from "react";
import "../globals.css";
import { getMetadata } from "@/lib/seo-utils";

// Centralized metadata for admin layout
export const metadata = getMetadata({
  title: "Admin Console – Flavor Studios",
  description: "Secure admin console for managing all Flavor Studios content and studio tools.",
  path: "/admin",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Admin Console – Flavor Studios",
    description: "Secure admin console for managing all Flavor Studios content and studio tools.",
    url: "https://flavorstudios.in/admin",
    type: "website",
    site_name: "Flavor Studios",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Admin Console – Flavor Studios",
    description: "Secure admin console for managing all Flavor Studios content and studio tools.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Admin Console – Flavor Studios",
    description: "Secure admin console for managing all Flavor Studios content and studio tools.",
    url: "https://flavorstudios.in/admin",
    applicationCategory: "AdministrativeApplication",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
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
    },
  },
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { schema } = metadata;

  return (
    <html lang="en">
      <head>
        {/* === Schema.org JSON-LD (renders if schema exists) === */}
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        )}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
