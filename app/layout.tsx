import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Poppins } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { GTMNoScript } from "@/components/gtm-noscript"
import { Suspense } from "react"
import { FacebookPixel } from "@/components/facebook-pixel"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Flavor Studios | Anime-Inspired Content",
  description: "Original anime-inspired content and creative studio",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/favicon.png", sizes: "180x180" },
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicons and Manifest */}
        <link rel="icon" href="/favicon.ico?v=1" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=1" />
        <link rel="apple-touch-icon" href="/favicon.png?v=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#111111" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        {/* ✅ Open Graph Meta Tags */}
        <meta property="og:title" content="Flavor Studios | Anime-Inspired Content" />
        <meta property="og:description" content="Original anime-inspired animations and creative stories." />
        <meta property="og:image" content="/screenshots/homepage.png" />
        <meta property="og:url" content="https://www.flavorstudios.in" />
        <meta property="og:type" content="website" />

        {/* ✅ Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flavor Studios | Anime-Inspired Content" />
        <meta name="twitter:description" content="Original anime-inspired animations and creative stories." />
        <meta name="twitter:image" content="/screenshots/homepage.png" />
        <meta name="twitter:site" content="@flavor_studios" />
      </head>
      <body className={`${orbitron.variable} ${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <GTMNoScript />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Header />
          <main className="flex-grow">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />

          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          <Suspense fallback={null}>
            <FacebookPixel />
          </Suspense>
        </ThemeProvider>

        {/* ✅ Dynamically load the service worker */}
        <script src="/pwa-register.js" defer></script>
      </body>
    </html>
  )
}
