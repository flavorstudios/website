import { PrismaClient, CategoryType } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Transform string "blog"/"video" to enum value
    let type: CategoryType
    if (data.type === "blog") type = CategoryType.BLOG
    else if (data.type === "video") type = CategoryType.VIDEO
    else throw new Error("Invalid category type")

    // Slugify name if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    // Check for duplicate (slug, type)
    const exists = await prisma.category.findUnique({
      where: { slug_type: { slug, type } },
    })
    if (exists) throw new Error("Category with this name/type already exists.")

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        type,
        description: data.description || "",
        color: data.color || null,
        icon: data.icon || null,
        order: typeof data.order === "number" ? data.order : 0,
        isActive: data.isActive !== false,
        postCount: 0,
      },
    })

    return NextResponse.json({ category })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 400 })
  }
}
