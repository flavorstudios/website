'use server'

import { revalidatePath } from "next/cache"
import { requireAdminAction } from "@/lib/admin-auth"

export async function clearAllCaches() {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  await new Promise((resolve) => setTimeout(resolve, 2000))

  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/blog")
  revalidatePath("/watch")

  return { success: true, message: "All caches cleared successfully" }
}

export async function revalidateEntireWebsite() {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/blog")
  revalidatePath("/watch")

  console.log("Revalidated entire website paths.")
  return { success: true, message: "Entire website revalidated successfully." }
}