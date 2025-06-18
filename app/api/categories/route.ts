import { NextResponse } from "next/server";
import { PrismaClient, Category as PrismaCategory } from "@prisma/client";
import globalConfig from "@/content-data/global-config.json";

const prisma = new PrismaClient();

type Category = PrismaCategory & typeof globalConfig;

function mergeWithGlobal(category: PrismaCategory): Category {
  // Merge: category fields take precedence, fallback to global config where missing
  return {
    ...globalConfig,
    ...category,
    publisher: globalConfig.publisher,
    icon: category.icon || globalConfig.icon,
    twitterSite: globalConfig.twitterSite,
    ogSiteName: globalConfig.ogSiteName,
  };
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" }, // Change to 'order' if your model has it
    });

    const blogCategories = categories
      .filter((c) => c.type === "blog")
      .map(mergeWithGlobal);

    // Accept both "video" or "watch" as your type
    const videoCategories = categories
      .filter((c) => c.type === "video" || c.type === "watch")
      .map(mergeWithGlobal);

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