import type React from "react"
import "../globals.css"
import { getMetadata } from "@/lib/seo-utils"

// Use centralized metadata for admin layout
export const metadata = getMetadata({
  title: "Flavor Studios Admin",
  description: "Admin dashboard for Flavor Studios",
  path: "/admin",
  robots: "noindex, nofollow",
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
