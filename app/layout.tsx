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
import AdblockBanner from "@/components/AdblockBanner";
import { ThemeProvider } from "@/components/theme-provider";
import CookieConsent from "./components/CookieConsent"; // ⬅️ Added

import { getMetadata, getSchema } from "@/lib/seo-utils";
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOGO_URL,
  SITE_BRAND_TWITTER,
  SITE_DESCRIPTION,
  SOCIAL_LINKS, // ⬅️ Already imported
} from "@/lib/constants";

// i18n additions
import { locales, defaultLocale } from "../i18n";
import { NextIntlProvider } from "@/lib/i18n";
import { headers } from "next/headers";

// --- SEO Default Metadata (App Router global metadata) ---
const baseMetadata = getMetadata({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    images: [{ url: `${SITE_URL}/cover.jpg`, width: 1200, height: 630 }],
    appId: "1404440770881914",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
// 🟩 Official platforms only, in audit-correct order, using centralized SOCIAL_LINKS
const orgSchema = getSchema({
  type: "Organization",
  path: "/",
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  image: SITE_LOGO_URL,
  sameAs: [
    SOCIAL_LINKS.youtube,
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.linkedin,
    SOCIAL_LINKS.threads,
    SOCIAL_LINKS.bluesky,
    SOCIAL_LINKS.reddit,
    SOCIAL_LINKS.x,
    SOCIAL_LINKS.tumblr,
    SOCIAL_LINKS.telegram,
    SOCIAL_LINKS.mastodon,
    SOCIAL_LINKS.discord,
  ],
});

import { getDynamicCategories } from "@/lib/dynamic-categories";
import Script from "next/script";
import type { Category } from "@/types/category";
import type { CategoryData } from "@/lib/dynamic-categories";

// 🟩 UPDATED GUARD: All fields properly checked!
function mapCategoryDataToCategory(
  cat: CategoryData,
  fallbackType: "blog" | "video",
): Category {
  return {
    id: typeof cat.id === "string"
      ? cat.id
      : typeof cat.slug === "string"
      ? `${fallbackType}-${cat.slug}`
      : `${fallbackType}-unknown`,
    name: typeof cat.name === "string" ? cat.name : "",
    slug: typeof cat.slug === "string" ? cat.slug : "",
    title: typeof cat.title === "string"
      ? cat.title
      : typeof cat.name === "string"
      ? cat.name
      : "",
    type:
      cat.type === "blog" || cat.type === "video"
        ? cat.type
        : fallbackType,
    postCount: Number(
      typeof cat.postCount !== "undefined"
        ? cat.postCount
        : typeof cat.count !== "undefined"
        ? cat.count
        : 0
    ),
    order: typeof cat.order === "number" ? cat.order : 0,
    isActive: typeof cat.isActive === "boolean" ? cat.isActive : true,
    tooltip: typeof cat.tooltip === "string" ? cat.tooltip : "",
  };
}

// --- i18n: dynamic locale/message loading ---
function getLocaleFromPath(pathname: string): string {
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  return locales.includes(maybeLocale as any) ? maybeLocale : defaultLocale;
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const output: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMerge(
        (output[key] as Record<string, unknown>) || {},
        value as Record<string, unknown>
      );
    } else {
      output[key] = value;
    }
  }
  return output;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = headers();
  const pathname =
    h.get("next-url") ||
    h.get("x-invoke-path") ||
    h.get("x-matched-path") ||
    "";

  const isAdmin = pathname.startsWith("/admin");

  let blogCategories: Category[] = [];
  let videoCategories: Category[] = [];

  if (!isAdmin) {
    const categories = await getDynamicCategories();
    blogCategories = (categories.blogCategories || []).map((cat: CategoryData) =>
      mapCategoryDataToCategory(cat, "blog")
    );
    videoCategories = (categories.videoCategories || []).map((cat: CategoryData) =>
      mapCategoryDataToCategory(cat, "video")
    );
  }

  const locale = getLocaleFromPath(pathname);
  const baseMessages = (await import(`../locales/en/common.json`)).default as Record<string, unknown>;
  let localeMessages: Record<string, unknown> = {};
  try {
    localeMessages = (await import(`../locales/${locale}/common.json`)).default;
  } catch {
    localeMessages = baseMessages;
  }
  const messages = deepMerge(baseMessages, localeMessages);

  return (
    <html lang={locale} style={{ fontFamily: "var(--font-poppins)" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="me" href="https://mastodon.social/@flavorstudios" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          suppressHydrationWarning
        />
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
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlProvider
            locale={locale}
            messages={messages}
            onError={(error: unknown) => {
              if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code: string }).code === "MISSING_MESSAGE"
              ) {
                console.warn(error);
              } else {
                throw error;
              }
            }}
          >
            <a
              href="#footer-navigation"
              className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-black text-white p-2"
            >
              {messages?.layout?.skipToFooter || "Skip to footer navigation"}
            </a>

            <noscript>
              <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager NoScript"
              />
            </noscript>

            <Toaster />
            <CookieConsent /> {/* ⬅️ Always render, component self-skips on /admin */}

            {!isAdmin && <AdblockBanner />}

            {!isAdmin && (
              <Header
                blogCategories={blogCategories}
                videoCategories={videoCategories}
              />
            )}

            <main>{children}</main>

            {!isAdmin && (
              <>
                <Footer />
                <BackToTop />
                <PwaServiceWorker />
                <Script src="/js/_support_banner.js" strategy="afterInteractive" />
              </>
            )}
          </NextIntlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
