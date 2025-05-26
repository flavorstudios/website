import type { Metadata } from "next"
import AdminLoginForm from "./AdminLoginForm"

// Hide from search engines
export const metadata: Metadata = {
  title: "Admin Login - Flavor Studios",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
}

export default function AdminLogin() {
  return <AdminLoginForm />
}
