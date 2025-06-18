import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Clean API route – NO static fallback, always from the DB!
export async function GET() {
  try {
    // Get categories grouped by type, just like your old structure
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    });

    const blogCategories = categories.filter(c => c.type === "blog");
    const videoCategories = categories.filter(c => c.type === "watch"); // Use "watch" as per your schema, not "video"

    return NextResponse.json({
      success: true,
      blogCategories,
      videoCategories,
    });
  } catch (error) {
    console.error("Failed to get categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get categories",
        blogCategories: [],
        videoCategories: [],
      },
      { status: 500 }
    );
  }
}