import type React from "react";
import "./globals.css";
import "./fonts/poppins.css"; // ✅ Local Poppins font (relative path, always works)
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Flavor Studios | Anime News & Original Stories That Inspire",
  description:
    "Flavor Studios brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.",
  metadataBase: new URL("https://flavorstudios.in"),
  robots: "index,follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "fediverse:creator": "@flavorstudios@mastodon.social",
    generator: "v0.dev",
    me: "https://mastodon.social/@flavorstudios",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read dynamic metadata injected by each page (if present)
  const headersList = headers();
  const schema = headersList.get("x-jsonld-schema");

  return (
    <html lang="en" style={{ fontFamily: "var(--font-poppins)" }}>
      <head>
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

        {/* === Inject JSON-LD Schema if present === */}
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: schema,
            }}
          />
        )}

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
      </head>
      <body className="antialiased">
        {/* === GTM (NOSCRIPT) === */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="GTM"
          />
        </noscript>
        {/* === END GTM (NOSCRIPT) === */}

        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}