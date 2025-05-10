import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Orbitron } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import MainNavigation from "@/components/main-navigation"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = Orbitron({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: {
    default: "Flavor Studios – Emotional 3D Anime & Life-Lessons",
    template: "%s | Flavor Studios",
  },
  description:
    "Official site of Flavor Studios – home of soulful 3D animations made with Blender. Anime-inspired stories on life, legacy, and light.",
  keywords: [
    "Flavor Studios",
    "Anime Studio",
    "Blender Animation",
    "Life Lessons",
    "3D Anime",
    "Original Anime Series",
  ],
  authors: [
    {
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
    },
  ],
  creator: "Flavor Studios",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flavorstudios.in",
    title: "Flavor Studios – Emotional 3D Anime & Life-Lessons",
    description: "Original 3D animations with deep stories, emotional moments, and anime-inspired visuals.",
    siteName: "Flavor Studios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Studios – Emotional 3D Anime & Life-Lessons",
    description: "Original 3D animations with deep stories, emotional moments, and anime-inspired visuals.",
    creator: "@flavor_studios",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontHeading.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <MainNavigation />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
