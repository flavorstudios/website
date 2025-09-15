'use server'

import { pageStore } from "@/lib/content-store"
import { revalidatePath } from "next/cache"
import { requireAdminAction } from "@/lib/admin-auth"

export async function updatePageContent(
  page: string,
  section: string,
  content: Record<string, unknown>
) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")
  await pageStore.update(page, section, content, "Admin")
  revalidatePath("/admin/dashboard")
  revalidatePath("/")
}