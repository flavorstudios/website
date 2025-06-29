// app/layout.tsx

import type React from "react";
import "./globals.css"; // Global styles
import "./fonts/poppins.css"; // Custom font

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
// import PwaServiceWorker from "@/components/PwaServiceWorker"; // Removed: now handled by next-pwa

import ConvertKitPopup from "@/components/ConvertKitPopup"; // <--- ADDED HERE

import { getMetadata, getSchema } from "@/lib/seo-utils";
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOGO_URL,
  SITE_BRAND_TWITTER,
} from "@/lib/constants";

// --- SEO Default Metadata (App Router global metadata) ---
export const metadata = getMetadata({
  title: SITE_NAME,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  path: "/",
  robots: "index,follow",
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent", // More modern translucent status bar on iOS
  },
  openGraph: {
    title: SITE_NAME,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: "Flavor Studios Cover Image",
      },
    ],
    appId: "1404440770881914",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: SITE_NAME,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// --- Global Organization Schema (JSON-LD) ---
const orgSchema = getSchema({
  type: "Organization",
  path: "/",
  title: SITE_NAME,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  image: SITE_LOGO_URL,
  sameAs: [
    "https://www.youtube.com/@flavorstudios",
    "https://www.instagram.com/flavorstudios",
    "https://twitter.com/flavor_studios",
    "https://www.facebook.com/flavourstudios",
    "https://www.linkedin.com/company/flavorstudios",
    "https://www.threads.net/@flavorstudios",
    "https://discord.gg/agSZAAeRzn",
    "https://t.me/flavorstudios",
    "https://www.reddit.com/r/flavorstudios/",
    "https://bsky.app/profile/flavorstudios.bsky.social",
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ fontFamily: "var(--font-poppins)" }}>
      <head>
        {/* === Mastodon Verification === */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />

        {/* === Global JSON-LD Schema === */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          suppressHydrationWarning
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
          suppressHydrationWarning
        />
        {/* === END GTM === */}
      </head>
      <body className="antialiased">
        {/* === Google Tag Manager (NoScript) === */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager NoScript"
          />
        </noscript>
        {/* === END NoScript === */}

        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />

        <ConvertKitPopup /> {/* <--- ADDED HERE, just above closing body tag */}

        {/* <PwaServiceWorker />  Removed: next-pwa now handles registration automatically */}
      </body>
    </html>
  );
}
