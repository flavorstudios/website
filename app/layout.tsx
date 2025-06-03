import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import Script from "next/script"
import { usePathname } from "next/navigation"

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
  keywords: [
    "animation",
    "anime",
    "design",
    "creative studio",
    "visual effects",
    "storytelling",
    "games",
  ],
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
    appId: "1404440770881914",
    images: [
      {
        url: "https://flavorstudios.in/cover.png",
        width: 1200,
        height: 630,
        alt: "Flavor Studios – Original Anime, Stories & Life Lessons",
        type: "image/png",
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
    images: ["https://flavorstudios.in/cover.png"],
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
  other: {
    "fediverse:creator": "@flavorstudios@mastodon.social",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin") // Block scripts for /admin

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Mastodon Verification */}
        <link rel="me" href="https://mastodon.social/@flavorstudios" />
        {/* Google Tag Manager (only on non-admin routes) */}
        {!isAdmin && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-WMTGR7NM');`,
            }}
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Google Tag Manager (noscript, only on non-admin routes) */}
        {!isAdmin && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  )
}
