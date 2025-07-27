// ✅ Codex Suggestion Implemented: Viewport meta added
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000", // you can change this to match your brand
};

import type { ReactNode } from "react";
import "./globals.css";
import "./fonts/poppins.css";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import Toaster from "@/components/ui/toaster";

import { getMetadata, getSchema } from "@/lib/seo-utils";
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOGO_URL,
  SITE_BRAND_TWITTER,
} from "@/lib/constants";

// --- SEO Default Metadata (App Router global metadata) ---
const baseMetadata = getMetadata({
  title: SITE_NAME,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: SITE_NAME,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    type: "website",
    images: [{ url: `${SITE_URL}/cover.jpg`, width: 1200, height: 630 }],
    appId: "1404440770881914",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: SITE_NAME,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export const metadata = {
  ...baseMetadata,
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
  },
};

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

import { getDynamicCategories } from "@/lib/dynamic-categories";
import { headers } from "next/headers";
import Script from "next/script"; // ADDED for GTM

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = headers();
  const pathname =
    h.get("next-url") ||
    h.get("x-invoke-path") ||
    h.get("x-matched-path") ||
    "";

  const isAdmin = pathname.startsWith("/admin");

  const { blogCategories, videoCategories } = isAdmin
    ? { blogCategories: [], videoCategories: [] }
    : await getDynamicCategories();

  return (
    <html lang="en" style={{ fontFamily: "var(--font-poppins)" }}>
      <head>
        {/* Meta viewport fallback for bots/legacy */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Mastodon Verification */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />

        {/* Global Organization JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          suppressHydrationWarning
        />

        {/* Google Tag Manager (HEAD) using next/script */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
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
        {/* END GTM (HEAD) */}
      </head>
      <body className="antialiased">
        {/* GTM (NOSCRIPT) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager NoScript"
          />
        </noscript>
        {/* END GTM (NOSCRIPT) */}

        <Toaster />

        {!isAdmin && (
          <Header blogCategories={blogCategories} videoCategories={videoCategories} />
        )}

        <main>{children}</main>

        {!isAdmin && (
          <>
            <Footer />
            <BackToTop />
            <PwaServiceWorker />
          </>
        )}
      </body>
    </html>
  );
}
