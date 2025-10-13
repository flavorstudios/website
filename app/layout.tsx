export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

import type { ReactNode } from "react";
import "./globals.css";
import { Poppins } from "next/font/google";

import Toaster from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import { AfterMainSlot, FooterSlot, HeaderSlot, LayoutSlotsRoot } from "@/components/layout-slots";

import { getMetadata, getSchema } from "@/lib/seo-utils";
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOGO_URL,
  SITE_BRAND_TWITTER,
  SITE_DESCRIPTION, // ✅ Use constant only
} from "@/lib/constants";
import { serverEnv } from "@/env/server";
import Script from "next/script"; // for GTM + bootstrap

// --- SEO Default Metadata (App Router global metadata) ---
const baseMetadata = getMetadata({
  title: SITE_NAME,
  description: SITE_DESCRIPTION, // ✅ Use constant only
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION, // ✅ Use constant only
    type: "website",
    images: [{ url: `${SITE_URL}/cover.jpg`, width: 1200, height: 630 }],
    appId: "1404440770881914",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: SITE_NAME,
    description: SITE_DESCRIPTION, // ✅ Use constant only
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
  description: SITE_DESCRIPTION, // ✅ Use constant only
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

// Ensure this layout is always dynamic (no static caching surprises)
export const dynamic = "force-dynamic";
export const revalidate = 0;

// next/font: load fonts with CSS variables exposed to globals.css
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

function DefaultHeader() {
  return (
    <div className="sr-only" aria-hidden="true">
      Flavor Studios navigation
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // GTM env flag
  const gtmId = serverEnv.NEXT_PUBLIC_GTM_CONTAINER_ID || "";

  return (
    <html
      lang="en"
      style={{ fontFamily: "'Poppins', sans-serif" }}
      suppressHydrationWarning
      data-app-env={serverEnv.NODE_ENV}
    >
      <head>
        {/* Meta viewport fallback for bots/legacy */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Skip link fallback styles (in case Tailwind utilities aren't loaded) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
.a11y-skip{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}
.a11y-skip:focus{left:0;top:0;clip:auto;width:auto;height:auto;overflow:visible;white-space:normal;z-index:10000;padding:.5rem .75rem;border-radius:.375rem;background:#fff;color:#111;box-shadow:0 0 0 4px rgba(59,130,246,.45)}
`,
          }}
        />

        {/* Mastodon Verification */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />

        {/* Global Organization JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          suppressHydrationWarning
        />

        {/* Google Tag Manager (HEAD) — only if container id is provided */}
        {gtmId && (
          <Script id="gtm-head" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}</Script>
        )}
        {/* END GTM (HEAD) */}
      </head>
      <body
        className={`${inter.variable} ${lora.variable} ${jetbrains.variable} ${poppins.variable} antialiased bg-white`}
      >
        <div id="top" />
        <LayoutSlotsRoot footer={<Footer />}>
          <ThemeProvider>
            <a href="#main" className="a11y-skip">
              Skip to main content
            </a>

            {/* GTM (NOSCRIPT) — only if container id is provided */}
            {gtmId && (
              <noscript>
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                  height="0"
                  width="0"
                  style={{ display: "none", visibility: "hidden" }}
                  title="Google Tag Manager NoScript"
                />
              </noscript>
            )}
            {/* END GTM (NOSCRIPT) */}

            <div className="flex min-h-screen flex-col">
              <header role="banner" className="w-full">
                <HeaderSlot fallback={<DefaultHeader />} />
              </header>

              <main
                id="main"
                role="main"
                tabIndex={-1}
                className="flex-1 focus-visible:outline-none"
              >
                {children}
              </main>

              <footer role="contentinfo" className="w-full">
                <FooterSlot fallback={<Footer />} />
              </footer>
            </div>

            <AfterMainSlot />

            <Toaster />
          </ThemeProvider>
        </LayoutSlotsRoot>
      </body>
    </html>
  );
}
