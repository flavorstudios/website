import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Flavor Studios - Creative Animation & Design",
    template: "%s | Flavor Studios",
  },
  description:
    "Professional animation studio specializing in creative storytelling, character design, and visual effects. Bringing your ideas to life with stunning animations.",
  keywords: ["animation", "design", "creative studio", "visual effects", "storytelling"],
  authors: [{ name: "Flavor Studios" }],
  creator: "Flavor Studios",
  publisher: "Flavor Studios",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
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
    google: "your-google-verification-code",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Flavor Studios - Creative Animation & Design",
    description:
      "Professional animation studio specializing in creative storytelling, character design, and visual effects.",
    siteName: "Flavor Studios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Studios - Creative Animation & Design",
    description:
      "Professional animation studio specializing in creative storytelling, character design, and visual effects.",
    creator: "@flavorstudios",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
