'use server'

import { redirect } from "next/navigation"
import { requireAdminAction } from "@/lib/admin-auth"

export async function logoutAdmin() {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  const response = await fetch("/api/admin/logout", { method: "POST" })
  if (response.ok) {
    redirect("/admin/login")
  }
}