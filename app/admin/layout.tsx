import type React from "react"
import "../globals.css"

export const metadata = {
  title: "Flavor Studios Admin",
  description: "Admin dashboard for Flavor Studios",
}

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
