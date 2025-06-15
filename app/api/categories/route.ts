import { NextResponse } from "next/server";
import { categoryStore } from "@/lib/category-store";

// Clean API route – NO static fallback, always from the store!
export async function GET() {
  try {
    // Get blog and video categories directly from the centralized store
    const blogCategories = await categoryStore.getByType("blog");
    const videoCategories = await categoryStore.getByType("video");

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