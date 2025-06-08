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

// Metadata for Next.js Metadata API (all other SEO info)
export const metadata = {
  title: "Flavor Studios – Anime & Stories That Stay With You",
  description:
    "Explore powerful animations, blogs, and games that inspire, entertain, and connect with your soul. Made with love by Flavor Studios.",
  metadataBase: new URL("https://flavorstudios.in"),
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* This is the **ONLY** correct way to declare the Facebook App ID for OG */}
        <meta property="fb:app_id" content="1404440770881914" />
        {/* Optional: Mastodon verification (social rel) */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
