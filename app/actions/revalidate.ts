"use server"

import { revalidatePath } from "next/cache"

export async function revalidateBlog() {
  revalidatePath("/blog")
}

export async function revalidateWatch() {
  revalidatePath("/watch")
}

export async function revalidateHome() {
  revalidatePath("/")
}
