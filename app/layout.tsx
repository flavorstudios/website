import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans, Content as FontHeading } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import MainNavigation from "@/components/main-navigation"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = FontHeading({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: {
    default: "Flavor Studios | Indie Anime Studio",
    template: "%s | Flavor Studios",
  },
  description: "Indie anime studio creating original animations and stories",
  keywords: ["anime", "animation", "studio", "indie", "flavor studios"],
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
    title: "Flavor Studios | Indie Anime Studio",
    description: "Indie anime studio creating original animations and stories",
    siteName: "Flavor Studios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Studios | Indie Anime Studio",
    description: "Indie anime studio creating original animations and stories",
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
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontHeading.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
