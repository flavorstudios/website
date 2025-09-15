'use server'

import { blogStore } from "@/lib/content-store"
import { revalidatePath } from "next/cache"
import { requireAdminAction } from "@/lib/admin-auth"

export async function createBlogPost(formData: FormData) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const status = formData.get("status") as "draft" | "published" | "scheduled"
  const category = formData.get("category") as string
  const tags = (formData.get("tags") as string)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  const featuredImage = formData.get("featuredImage") as string
  const seoTitle = formData.get("seoTitle") as string
  const seoDescription = formData.get("seoDescription") as string
  const publishedAt = formData.get("publishedAt") as string

  await blogStore.create({
    title,
    slug,
    content,
    excerpt,
    status,
    category,
    categories: [category],
    tags,
    featuredImage,
    seoTitle,
    seoDescription,
    author: "Admin",
    publishedAt: publishedAt || new Date().toISOString(),
  })

  revalidatePath("/admin/dashboard")
}

export async function updateBlogPost(id: string, formData: FormData) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  const category = formData.get("category") as string
  const updates = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    excerpt: formData.get("excerpt") as string,
    status: formData.get("status") as "draft" | "published" | "scheduled",
    category,
    categories: [category],
    tags: (formData.get("tags") as string)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    featuredImage: formData.get("featuredImage") as string,
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    publishedAt: formData.get("publishedAt") as string,
  }

  await blogStore.update(id, updates)
  revalidatePath("/admin/dashboard")
}

export async function deleteBlogPost(id: string) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")
  await blogStore.delete(id)
  revalidatePath("/admin/dashboard")
}

export async function revalidateBlogAndAdminDashboard() {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  revalidatePath("/blog")
  revalidatePath("/admin/dashboard")
  return { success: true, message: "Blog and Admin Dashboard revalidated." }
}