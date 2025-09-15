'use server'

import { commentStore } from "@/lib/comment-store"
import { revalidatePath } from "next/cache"
import { requireAdminAction } from "@/lib/admin-auth"

export async function updateCommentStatus(
  postId: string,
  commentId: string,
  status: "pending" | "approved" | "spam" | "trash"
) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")
  await commentStore.updateStatus(postId, commentId, status)
  revalidatePath("/admin/dashboard")
}

export async function deleteComment(postId: string, commentId: string) {
  if (!(await requireAdminAction())) throw new Error("Unauthorized")
  await commentStore.delete(postId, commentId)
  revalidatePath("/admin/dashboard")
}