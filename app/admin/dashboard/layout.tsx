import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin-session")?.value === "authenticated"

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return <>{children}</>
}
