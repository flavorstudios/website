export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
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

import { getMetadata, getSchema } from "@/lib/seo-utils";
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOGO_URL,
  SITE_BRAND_TWITTER,
  SITE_DESCRIPTION, // ✅ Use constant only
} from "@/lib/constants";

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

import { getDynamicCategories } from "@/lib/dynamic-categories";
import { headers, cookies } from "next/headers";
import Script from "next/script"; // ADDED for GTM
import { verifyAdminSession } from "@/lib/admin-auth";
import { shouldShowCookieConsent, isAdminRoute } from "@/lib/cookie-consent";

// --- Type "Category" should have id, title, type, postCount, name, slug, tooltip, etc. ---
import type { Category } from "@/types/category";
import type { CategoryData } from "@/lib/dynamic-categories";

// Ensure this layout is always dynamic (no static caching surprises)
export const dynamic = "force-dynamic";

// 🟩 UPDATED GUARD: All fields properly checked!
function mapCategoryDataToCategory(
  cat: CategoryData,
  fallbackType: "blog" | "video",
): Category {
  return {
    id:
      typeof cat.id === "string"
        ? cat.id
        : typeof cat.slug === "string"
        ? `${fallbackType}-${cat.slug}`
        : `${fallbackType}-unknown`,
    name: typeof cat.name === "string" ? cat.name : "",
    slug: typeof cat.slug === "string" ? cat.slug : "",
    title:
      typeof cat.title === "string"
        ? cat.title
        : typeof cat.name === "string"
        ? cat.name
        : "",
    type: cat.type === "blog" || cat.type === "video" ? cat.type : fallbackType,
    postCount: Number(
      typeof cat.postCount !== "undefined"
        ? cat.postCount
        : typeof cat.count !== "undefined"
        ? cat.count
        : 0,
    ),
    order: typeof cat.order === "number" ? cat.order : 0,
    isActive: typeof cat.isActive === "boolean" ? cat.isActive : true,
    tooltip: typeof cat.tooltip === "string" ? cat.tooltip : "",
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = headers(); // synchronous in App Router

  // Derive pathname from headers; prioritize x-url if middleware sets it.
  const rawPath =
    h.get("x-url") ||
    h.get("x-invoke-path") ||
    h.get("next-url") ||
    h.get("x-matched-path") ||
    h.get("x-pathname") ||
    "/";

  // Normalize to a pathname (handle full URLs defensively)
  let pathname = "/";
  try {
    pathname = rawPath.startsWith("/")
      ? rawPath
      : new URL(rawPath, `http://${h.get("host") || "localhost"}`).pathname;
  } catch {
    pathname = "/";
  }

  // Admin route prefixes from env (comma-separated)
  const adminPrefixesEnv = process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES || "";
  const adminPrefixes = adminPrefixesEnv
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const isAdmin = isAdminRoute(
    pathname,
    adminPrefixes.length ? adminPrefixes : undefined,
  );

  // Determine admin user via session cookie
  const cookieStore = cookies(); // synchronous
  const sessionCookie = cookieStore.get("admin-session")?.value;
  let isAdminUser = false;
  if (sessionCookie) {
    try {
      await verifyAdminSession(sessionCookie);
      isAdminUser = true;
    } catch {
      // ignore invalid session
    }
  }

  // Existing consent state (CookieYes)
  const consentCookie =
    cookieStore.get("cookieyes-consent")?.value ||
    cookieStore.get("cky-consent")?.value;

  // Allowed domains for banner
  const allowedDomainsEnv =
    process.env.NEXT_PUBLIC_COOKIE_ALLOWED_DOMAINS ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";
  const allowedDomains = allowedDomainsEnv
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  // Optional QA override to force-enable on non-prod
  const forceEnable =
    process.env.NEXT_PUBLIC_COOKIE_DEBUG?.toLowerCase() === "true" ||
    process.env.NEXT_PUBLIC_COOKIE_DEBUG === "1";

  const showCookieConsent = shouldShowCookieConsent({
    env: process.env.NODE_ENV || "development",
    host: h.get("host") || "",
    pathname,
    allowedDomains,
    isAdminUser,
    hasConsent: Boolean(consentCookie),
    adminPrefixes,
    forceEnable,
  });

  let blogCategories: Category[] = [];
  let videoCategories: Category[] = [];

  if (!isAdmin) {
    const categories = await getDynamicCategories();
    // Map to full Category type expected by Header
    blogCategories = (categories.blogCategories || []).map((cat: CategoryData) =>
      mapCategoryDataToCategory(cat, "blog"),
    );
    videoCategories = (categories.videoCategories || []).map(
      (cat: CategoryData) => mapCategoryDataToCategory(cat, "video"),
    );
  }

  return (
    <html
      lang="en"
      style={{ fontFamily: "var(--font-poppins)" }}
      suppressHydrationWarning
    >
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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

          {/* ⭐️ AdBlock Support Banner (only for non-admin routes) */}
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
              {/* ⭐️ LOAD the stealth detection script only for non-admin */}
              <Script src="/js/_support_banner.js" strategy="afterInteractive" />
              {/* CookieYes script: gated by env/host/route/role/consent */}
              {showCookieConsent &&
                process.env.NEXT_PUBLIC_COOKIEYES_SCRIPT_URL && (
                  <Script
                    id="cookieyes"
                    src={process.env.NEXT_PUBLIC_COOKIEYES_SCRIPT_URL}
                    strategy="afterInteractive"
                  />
                )}
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
