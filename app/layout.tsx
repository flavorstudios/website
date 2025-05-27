import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JsonLd } from "@/components/seo/json-ld"
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo-utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "Flavor Studios - Independent Animation Studio",
    template: "%s | Flavor Studios",
  },
  description:
    "Independent animation studio specializing in emotionally resonant 3D animated content and original anime series. Crafting stories with soul—one frame at a time.",
  keywords: ["animation", "anime", "3D animation", "Blender", "independent studio", "storytelling", "original content"],
  authors: [{ name: "Flavor Studios" }],
  creator: "Flavor Studios",
  publisher: "Flavor Studios",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"),
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flavorstudios.in",
    title: "Flavor Studios - Independent Animation Studio",
    description:
      "Independent animation studio specializing in emotionally resonant 3D animated content and original anime series.",
    siteName: "Flavor Studios",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Flavor Studios - Independent Animation Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Studios - Independent Animation Studio",
    description:
      "Independent animation studio specializing in emotionally resonant 3D animated content and original anime series.",
    creator: "@flavor_studios",
    images: ["/og-image.jpg"],
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
        <JsonLd data={generateWebsiteSchema()} />
        <JsonLd data={generateOrganizationSchema()} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
