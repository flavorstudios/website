// app/api/categories/route.ts

import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient, CategoryType } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type")
    const select = { name: true, slug: true, postCount: true, tooltip: true }

    // Fetching categories based on type
    if (type === "blog") {
      const categories = await prisma.category.findMany({
        where: { type: CategoryType.BLOG, isActive: true },
        orderBy: { order: "asc" },
        select,
      })
      const response = NextResponse.json({
        categories: categories.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          count: cat.postCount ?? 0,
          tooltip: cat.tooltip ?? undefined,
        })),
      })
      response.headers.set("Cache-Control", "public, max-age=300") // Cache for 5 minutes
      return response
    }

    if (type === "video") {
      const categories = await prisma.category.findMany({
        where: { type: CategoryType.VIDEO, isActive: true },
        orderBy: { order: "asc" },
        select,
      })
      const response = NextResponse.json({
        categories: categories.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          count: cat.postCount ?? 0,
          tooltip: cat.tooltip ?? undefined,
        })),
      })
      response.headers.set("Cache-Control", "public, max-age=300") // Cache for 5 minutes
      return response
    }

    // No type: return both blog and video categories
    const [blogCategories, videoCategories] = await Promise.all([
      prisma.category.findMany({
        where: { type: CategoryType.BLOG, isActive: true },
        orderBy: { order: "asc" },
        select,
      }),
      prisma.category.findMany({
        where: { type: CategoryType.VIDEO, isActive: true },
        orderBy: { order: "asc" },
        select,
      }),
    ])

    const response = NextResponse.json({
      blogCategories: blogCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.postCount ?? 0,
        tooltip: cat.tooltip ?? undefined,
      })),
      videoCategories: videoCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.postCount ?? 0,
        tooltip: cat.tooltip ?? undefined,
      })),
    })
    response.headers.set("Cache-Control", "public, max-age=300") // Cache for 5 minutes
    return response
  } catch (error) {
    console.error("Failed to get categories:", error)
    return NextResponse.json(
      {
        blogCategories: [],
        videoCategories: [],
        error: "Failed to get categories",
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
