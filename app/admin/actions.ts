"use server"

import { blogStore, videoStore, commentStore, pageStore } from "@/lib/admin-store"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Blog actions
export async function createBlogPost(formData: FormData) {
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
  const updates = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    excerpt: formData.get("excerpt") as string,
    status: formData.get("status") as "draft" | "published" | "scheduled",
    category: formData.get("category") as string,
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
  await blogStore.delete(id)
  revalidatePath("/admin/dashboard")
}

// Video actions
export async function createVideo(formData: FormData) {
  const title = formData.get("title") as string
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
  const updates = {
    title: formData.get("title") as string,
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
  await videoStore.delete(id)
  revalidatePath("/admin/dashboard")
}

// Comment actions
export async function updateCommentStatus(id: string, status: "pending" | "approved" | "spam" | "trash") {
  await commentStore.updateStatus(id, status)
  revalidatePath("/admin/dashboard")
}

export async function deleteComment(id: string) {
  await commentStore.delete(id)
  revalidatePath("/admin/dashboard")
}

// Page content actions
export async function updatePageContent(page: string, section: string, content: Record<string, any>) {
  await pageStore.update(page, section, content, "Admin")
  revalidatePath("/admin/dashboard")
  revalidatePath("/")
}

// System actions
export async function clearAllCaches() {
  // Simulate cache clearing with real delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Revalidate all paths
  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/blog")
  revalidatePath("/watch")

  return { success: true, message: "All caches cleared successfully" }
}

export async function logoutAdmin() {
  const response = await fetch("/api/admin/auth", { method: "DELETE" })
  if (response.ok) {
    redirect("/admin/login")
  }
}

export async function revalidateBlogAndAdminDashboard() {
  revalidatePath("/blog")
  revalidatePath("/admin/dashboard")
  // Optionally revalidate specific blog post paths if needed
  // const posts = await blogStore.getAll(); // Assuming blogStore has such a method
  // posts.forEach(post => revalidatePath(`/blog/${post.slug}`));
  return { success: true, message: "Blog and Admin Dashboard revalidated." }
}

// Rename clearAllCaches to revalidateEntireWebsite
export async function revalidateEntireWebsite() {
  // Simulate delay if necessary, or remove if not needed for revalidation
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/blog")
  // Add other key paths if necessary
  // e.g., videoStore.getAll().then(videos => videos.forEach(v => revalidatePath(`/watch/${v.slug}`)));
  // pageStore.getAll().then(pages => pages.forEach(p => revalidatePath(`/${p.slug}`)));
  revalidatePath("/watch")
  // Add more paths as needed

  console.log("Revalidated entire website paths.")
  return { success: true, message: "Entire website revalidated successfully." }
}
