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

  const post = await blogStore.create({
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

  if (post.status === "published") {
    revalidatePath("/blog")
    if (post.slug) {
      revalidatePath(`/blog/${post.slug}`)
    }
  }

  revalidatePath("/admin/dashboard")
}

export async function updateBlogPost(id: string, formData: FormData) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")

  const existing = await blogStore.getById(id)
  if (!existing) throw new Error("Post not found")

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

  const incomingSlug = updates.slug
  if (incomingSlug && existing.slug && incomingSlug !== existing.slug) {
    revalidatePath(`/blog/${existing.slug}`)
  }

  const updated = await blogStore.update(id, updates)
  if (!updated) throw new Error("Failed to update post")

  if (updated.status === "published" || existing.status === "published") {
    revalidatePath("/blog")
    if (updated.slug) {
      revalidatePath(`/blog/${updated.slug}`)
    }
  }
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