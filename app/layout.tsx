import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Flavor Studios – Anime & Stories That Stay With You",
    template: "%s | Flavor Studios",
  },
  description:
    "Explore powerful animations, blogs, and games that inspire, entertain, and connect with your soul. Made with love by Flavor Studios.",
  keywords: ["animation", "anime", "design", "creative studio", "visual effects", "storytelling", "games"],
  authors: [{ name: "Flavor Studios", url: "https://flavorstudios.in" }],
  creator: "Flavor Studios",
  publisher: "Flavor Studios",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://flavorstudios.in"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "MeePZ4w9DtPgCxWKExhl-q-KmjeE9F3nhDU9Iu2QKhY",
  },
  openGraph: {
    title: "Flavor Studios – Anime & Stories That Stay With You",
    description:
      "Explore powerful animations, blogs, and games that inspire, entertain, and connect with your soul. Made with love by Flavor Studios.",
    url: "https://flavorstudios.in",
    type: "website",
    locale: "en_US",
    siteName: "Flavor Studios",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "Flavor Studios – Anime & Stories That Stay With You",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavor_studios",
    creator: "@flavor_studios",
    title: "Flavor Studios – Anime & Stories That Stay With You",
    description:
      "Explore powerful animations, blogs, and games that inspire, entertain, and connect with your soul. Made with love by Flavor Studios.",
    images: ["https://flavorstudios.in/cover.jpg?v=2"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appLinks: {
    web: {
      url: "https://flavorstudios.in",
    },
  },
  other: {
    "fediverse:creator": "@flavorstudios@mastodon.social",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="me" href="https://mastodon.social/@flavorstudios" />
        <meta property="fb:app_id" content="1404440770881914" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  )
}
