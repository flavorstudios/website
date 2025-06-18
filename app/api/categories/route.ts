import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import globalConfig from "@/content-data/global-config.json";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" }, // Always sort by 'order'
    });

    // Utility to flatten category for menu/SEO usage
    const shapeCategory = (cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      label: cat.accessibleLabel || cat.title,
      title: cat.title,
      description: cat.description,
      menuDescription: cat.menuDescription || "", // <-- NEW: short description for menu/tooltips
      icon: cat.icon || globalConfig.icon,
      order: cat.order,
      isActive: cat.isActive,
      // All SEO fields below are needed for page meta/rendering:
      metaTitle: cat.metaTitle,
      metaDescription: cat.metaDescription,
      canonicalUrl: cat.canonicalUrl,
      robots: cat.robots,
      ogTitle: cat.ogTitle,
      ogDescription: cat.ogDescription,
      ogUrl: cat.ogUrl,
      ogType: cat.ogType,
      ogSiteName: cat.ogSiteName || globalConfig.ogSiteName,
      ogImages: cat.ogImages,
      twitterCard: cat.twitterCard,
      twitterSite: cat.twitterSite || globalConfig.twitterSite,
      twitterTitle: cat.twitterTitle,
      twitterDescription: cat.twitterDescription,
      twitterImages: cat.twitterImages,
      schema: cat.schema,
      postCount: cat.postCount,
    });

    const blogCategories = categories
      .filter((c) => c.type === "blog")
      .map(shapeCategory);

    const videoCategories = categories
      .filter((c) => c.type === "video" || c.type === "watch")
      .map(shapeCategory);

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