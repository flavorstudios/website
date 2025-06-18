import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT: Update a category by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();

    // Try updating by ID (assume ID is a string; Prisma will cast if needed)
    const category = await prisma.category.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        order: data.order,
        description: data.description,
        icon: data.icon,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    // Prisma throws if not found
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 400 });
  }
}

// DELETE: Delete a category by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Prisma throws if not found
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 400 });
  }
}