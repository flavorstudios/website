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
    "fb:app_id": "1404440770881914", // Global Facebook App ID
    "fediverse:creator": "@flavorstudios@mastodon.social",
    generator: "v0.dev",
    "me": "https://mastodon.social/@flavorstudios", // Mastodon verification
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
