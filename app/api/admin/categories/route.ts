import { requireAdmin } from "@/lib/admin-auth"
import { PrismaClient, CategoryType } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const typeParam = request.nextUrl?.searchParams?.get("type")
    
    // Initialize where filter
    const where = typeParam ? { type: typeParam === "blog" ? CategoryType.BLOG : CategoryType.VIDEO } : {}

    // Fetch categories based on type (blog/video)
    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        color: true,
        icon: true,
        order: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        postCount: true,
        tooltip: true, // Ensure tooltip field is included in Prisma schema
      },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
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
        tooltip: data.tooltip || "", // Add this field if present
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
  } finally {
    await prisma.$disconnect()
  }
}
