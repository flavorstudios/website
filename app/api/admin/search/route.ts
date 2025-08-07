import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { blogStore } from "@/lib/content-store"
import { categoryStore } from "@/lib/category-store"
import { adminAuth } from "@/lib/firebase-admin"

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const query = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? ""

    const [posts, categories, usersSnap] = await Promise.all([
      blogStore.getAll(),
      categoryStore.getAll(),
      adminAuth.listUsers(1000),
    ])

    const postsFiltered = posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query),
      )
      .map((p) => ({ id: p.id, title: p.title }))

    const categoriesFiltered = categories
      .filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          (c.slug || "").toLowerCase().includes(query),
      )
      .map((c) => ({ id: c.id, title: c.title }))

    const usersFiltered = usersSnap.users
      .filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.displayName?.toLowerCase().includes(query),
      )
      .map((u) => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
      }))

    return NextResponse.json({
      posts: postsFiltered,
      users: usersFiltered,
      categories: categoriesFiltered,
    })
  } catch (err) {
    console.error("admin search error", err)
    return NextResponse.json(
      { posts: [], users: [], categories: [], error: "Search failed" },
      { status: 500 },
    )
  }
}