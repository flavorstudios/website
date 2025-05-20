"use client"

import type React from "react"
import { Orbitron, Poppins } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

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
  const searchParams = useSearchParams()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Basic favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${orbitron.variable} ${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CookieConsent />
            <Analytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
