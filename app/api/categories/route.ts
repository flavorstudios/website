import { NextResponse } from "next/server"
import { PrismaClient, CategoryType } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch blog categories (type: BLOG)
    const blogCategories = await prisma.category.findMany({
      where: { type: CategoryType.BLOG, isActive: true },
      orderBy: { order: "asc" },
      select: {
        name: true,
        slug: true,
        postCount: true,
      },
    })

    // Fetch video categories (type: VIDEO)
    const videoCategories = await prisma.category.findMany({
      where: { type: CategoryType.VIDEO, isActive: true },
      orderBy: { order: "asc" },
      select: {
        name: true,
        slug: true,
        postCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      blogCategories: blogCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.postCount ?? 0,
      })),
      videoCategories: videoCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.postCount ?? 0,
      })),
    })
  } catch (error) {
    console.error("Failed to get categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get categories",
        blogCategories: [],
        videoCategories: [],
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
