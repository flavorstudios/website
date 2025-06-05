import type { Metadata } from "next"
import AdminLoginForm from "./AdminLoginForm"

export const metadata: Metadata = {
  title: "Admin Login | Flavor Studios",
  description: "Access your creative command center",
  robots: "noindex, nofollow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function AdminLoginPage() {
  return <AdminLoginForm />
}
