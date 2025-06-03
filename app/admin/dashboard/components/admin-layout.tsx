import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Flavor Studios Admin Dashboard",
  icons: { icon: "/favicon.ico" },
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
