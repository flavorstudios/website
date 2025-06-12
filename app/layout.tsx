import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Flavor Studios | Anime News & Original Stories That Inspire",
  description:
    "Flavor Studios brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.",
  metadataBase: new URL("https://flavorstudios.in"),
  robots: "index,follow", // Explicitly set robots for the root layout
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* === Facebook Open Graph App ID (if you ever use Facebook Insights) === */}
        <meta property="fb:app_id" content="1404440770881914" />
        {/* === Mastodon Verification for Fediverse === */}
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
        {/* === END Google Tag Manager (HEAD) === */}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* === Google Tag Manager (NOSCRIPT, immediately after <body>) === */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="GTM"
          />
        </noscript>
        {/* === END Google Tag Manager (NOSCRIPT) === */}

        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
