"use client"

import type React from "react"
import { Orbitron, Poppins } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { GTMNoScript } from "@/components/gtm-noscript"
import { Suspense } from "react"
import { FacebookPixel } from "@/components/facebook-pixel"
import { CookieConsentHandler } from "@/components/cookie-consent-handler"
import { CookieYesLoader } from "@/components/cookie-yes-loader"

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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Force favicon refresh with cache-busting query parameter */}
        <link rel="icon" href="/favicon.ico?v=1" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=1" />
        <link rel="apple-touch-icon" href="/favicon.png?v=1" />

        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#111111" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        {/* Start CookieYes banner */}

        {/* End CookieYes banner */}
      </head>
      <body className={`${orbitron.variable} ${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* Google Tag Manager (noscript) - placed immediately after opening body tag */}
        <GTMNoScript />

        {/* Cookie Consent Handler */}
        <CookieConsentHandler />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Header />
          <main className="flex-grow">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />

          {/* Analytics scripts wrapped in Suspense */}
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>

          {/* Facebook Pixel */}
          <Suspense fallback={null}>
            <FacebookPixel />
          </Suspense>
        </ThemeProvider>

        {/* Service Worker Registration */}
        <script src="/register-sw.js" defer></script>

        {/* CookieYes Custom Styling */}
        <style jsx global>{`
          /* CookieYes Banner Styling */
          #cky-consent {
            font-family: var(--font-poppins), sans-serif !important;
          }
          
          .cky-consent-container .cky-consent-bar {
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
          }
          
          .cky-btn {
            border-radius: 0.375rem !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
          }
          
          .cky-btn-accept {
            background-color: hsl(270, 95%, 60%) !important;
          }
          
          .cky-btn-accept:hover {
            background-color: hsl(270, 95%, 50%) !important;
          }
          
          /* Hide CookieYes Icon after consent */
          .cky-revisit-bottom-left,
          .cky-revisit-bottom-right,
          .cky-revisit-top-left,
          .cky-revisit-top-right {
            display: none !important;
          }
          
          /* Ensure proper dark mode support */
          .dark .cky-consent-container .cky-consent-bar {
            background-color: #1a1a1a !important;
            color: #ffffff !important;
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .cky-consent-container .cky-consent-bar {
              padding: 1rem !important;
            }
            
            .cky-notice-btn-wrapper {
              flex-wrap: wrap !important;
              gap: 0.5rem !important;
            }
          }
        `}</style>
        <CookieYesLoader />
      </body>
    </html>
  )
}
