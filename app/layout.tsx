import type React from "react";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";

// Font setup
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"], // Add more weights if needed: "300", "700", etc.
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Flavor Studios | Anime News & Original Stories That Inspire",
  description:
    "Flavor Studios brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.",
  metadataBase: new URL("https://flavorstudios.in"),
  robots: "index,follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  other: {
    "fediverse:creator": "@flavorstudios@mastodon.social",
    generator: "v0.dev",
    me: "https://mastodon.social/@flavorstudios",
  },
  // Do NOT add openGraph, twitter, or robots here—handled per-page!
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { schema } = metadata;

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* === Facebook Open Graph App ID === */}
        <meta property="fb:app_id" content="1404440770881914" />

        {/* === Mastodon Verification === */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />

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

        {/* === Schema.org JSON-LD === */}
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        )}
      </head>
      <body className={`${poppins.className} antialiased`}>
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
