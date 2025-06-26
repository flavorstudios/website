// app/layout.tsx

import type React from "react";
import "./globals.css"; // Global styles
import "./fonts/poppins.css"; // Custom font

// REMOVED: The empty 'import' statement that caused a syntax error.

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import PwaServiceWorker from "@/components/PwaServiceWorker"; // PWA service worker registration

import { getMetadata, getSchema } from "@/lib/seo-utils"; // Centralized SEO helpers
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants"; // Site-wide constants

// --- SEO Default Metadata (App Router global metadata) ---
// This object defines the default metadata for the entire application.
// Next.js automatically injects these into the <head> of every page.
export const metadata = getMetadata({
  title: SITE_NAME, // Default title for pages that don't specify one
  description:
    `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  path: "/", // Base path for the entire site (used by getMetadata for canonical URL)
  robots: "index,follow", // Default robots directive for public pages
  openGraph: {
    title: SITE_NAME,
    description:
      `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    type: "website", // Standard Open Graph type for a general website
    images: [
      { url: `${SITE_URL}/cover.jpg`, width: 1200, height: 630 }, // Default Open Graph image
    ],
    appId: "1404440770881914", // Facebook Open Graph App ID (managed by Next.js Metadata API)
  },
  twitter: {
    card: "summary_large_image", // Preferred Twitter card type
    site: SITE_BRAND_TWITTER, // Consistent Twitter handle from constants (e.g., "@flavor_studios")
    creator: SITE_BRAND_TWITTER, // Consistent Twitter handle from constants
    title: SITE_NAME,
    description:
      `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  metadataBase: new URL(SITE_URL), // Essential for resolving relative metadata URLs to absolute URLs.
  manifest: "/manifest.webmanifest", // PWA manifest link (managed by Next.js Metadata API)
  themeColor: "#000000", // Theme color for PWA (managed by Next.js Metadata API)
  icons: { // Favicons and Apple Touch Icons (managed by Next.js Metadata API)
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { // Apple PWA specific settings (managed by Next.js Metadata API)
    capable: true,
    statusBarStyle: "black",
  },
});

// --- Global Organization Schema (JSON-LD) ---
// This schema defines your organization globally for search engines.
// ALL social links below should be live/official and canonical URLs for best SEO results.
const orgSchema = getSchema({
  type: "Organization",
  path: "/", // Applied to the root of the site
  title: SITE_NAME,
  description:
    `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  image: SITE_LOGO_URL, // Your official brand logo for the organization
  publisher: { // For Organization schema, the publisher is typically the organization itself.
    name: SITE_NAME,
    logo: SITE_LOGO_URL,
  },
  sameAs: [ // Official social media and other web profiles for your organization.
    // CORRECTED: YouTube Channel URL from your screenshot.
    "https://www.youtube.com/@flavorstudios",
    "https://www.instagram.com/flavorstudios",
    "https://twitter.com/flavor_studios", // Correct and consistent Twitter URL.
    "https://www.facebook.com/flavourstudios",
    "https://www.linkedin.com/company/flavorstudios",
    "https://www.threads.net/@flavorstudios",
    "https://discord.gg/agSZAAeRzn", // Valid Discord invite link.
    "https://t.me/flavorstudios",
    "https://www.reddit.com/r/flavorstudios/",
    "https://bsky.app/profile/flavorstudios.bsky.social"
  ]
});

// RootLayout is a Server Component that wraps the entire application.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ fontFamily: "var(--font-poppins)" }}>
      <head>
        {/*
          NOTE: Most <head> tags are now managed by `export const metadata` above.
          Only highly specific or script-based tags (like GTM or rel="me") are placed here.
        */}

        {/* === Mastodon Verification (if strictly required) === */}
        {/* Next.js Metadata API doesn't directly support rel="me". Keep manually if needed. */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />

        {/* === Global Organization JSON-LD Schema === */}
        {/* This JSON-LD defines your organization for search engines globally. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          suppressHydrationWarning // Prevents hydration warnings for static JSON-LD script.
        />

        {/* === Google Tag Manager (HEAD - GTM's recommended placement) === */}
        {/* This script initiates Google Tag Manager for analytics and tracking. */}
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
          suppressHydrationWarning // Prevents hydration warnings for GTM script.
        />
        {/* === END GTM (HEAD) === */}
      </head>
      <body className="antialiased">
        {/* === GTM (NOSCRIPT - GTM's recommended placement) === */}
        {/* Fallback for users with JavaScript disabled, for Google Tag Manager. */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager NoScript" // Added title for accessibility
          />
        </noscript>
        {/* === END GTM (NOSCRIPT) === */}

        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
        <PwaServiceWorker /> {/* PWA Service Worker registration */}
      </body>
    </html>
  );
}
