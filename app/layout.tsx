import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Orbitron, Poppins } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"

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
        {/* Basic favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Google Tag Manager (Head) */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W7GC5SVZ');
          `}
        </Script>

        {/* CookieYes (leave as is, just a script) */}
        <script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/a5532f07a3a3cb960fbc8715/script.js"
        ></script>
      </head>
      <body className={`${orbitron.variable} ${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* Google Tag Manager (noscript fallback) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W7GC5SVZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}
