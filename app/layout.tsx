import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Flavor Studios - Independent Anime Studio",
  description:
    "Your destination for original anime content, industry news, and creative storytelling. We're passionate creators bringing unique anime experiences to life.",
  keywords: "anime, animation, studio, original content, creative storytelling",
  authors: [{ name: "Flavor Studios" }],
  openGraph: {
    title: "Flavor Studios - Independent Anime Studio",
    description: "Your destination for original anime content, industry news, and creative storytelling.",
    url: "https://flavorstudios.in",
    siteName: "Flavor Studios",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Studios - Independent Anime Studio",
    description: "Your destination for original anime content, industry news, and creative storytelling.",
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
