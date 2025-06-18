import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all categories (for admin panel)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Required: title, slug, type (and order if you want custom ordering)
    if (!data.title || !data.slug || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Optionally add more fields (description, icon, etc) as your model grows
    const category = await prisma.category.create({
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        order: data.order || 0, // default to 0 if not provided
        description: data.description || "",
        icon: data.icon || "",
      },
    });
    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 400 }
    );
  }
}