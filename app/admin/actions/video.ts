'use server'

import { videoStore } from "@/lib/content-store"
import { revalidatePath } from "next/cache"
import { requireAdminAction } from "@/lib/admin-auth"

export async function createVideo(formData: FormData) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const youtubeId = formData.get("youtubeId") as string
  const thumbnail = formData.get("thumbnail") as string
  const duration = formData.get("duration") as string
  const category = formData.get("category") as string
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  const status = formData.get("status") as "draft" | "published"
  const publishedAt = formData.get("publishedAt") as string

  await videoStore.create({
    title,
    slug,
    description,
    youtubeId,
    thumbnail,
    duration,
    category,
    tags,
    status,
    publishedAt: publishedAt || new Date().toISOString(),
  })

  revalidatePath("/admin/dashboard")
}

export async function updateVideo(id: string, formData: FormData) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  const updates = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    youtubeId: formData.get("youtubeId") as string,
    thumbnail: formData.get("thumbnail") as string,
    duration: formData.get("duration") as string,
    category: formData.get("category") as string,
    tags: (formData.get("tags") as string)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    status: formData.get("status") as "draft" | "published",
    publishedAt: formData.get("publishedAt") as string,
  }

  await videoStore.update(id, updates)
  revalidatePath("/admin/dashboard")
}

export async function deleteVideo(id: string) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")
  await videoStore.delete(id)
  revalidatePath("/admin/dashboard")
}