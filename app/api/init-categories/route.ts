import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import defaultCategories from "@/content-data/categories.json";

// Secure secret key for protected admin access
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function POST(req: Request) {
  const auth = req.headers.get("x-admin-secret");
  if (auth !== ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blogCategories = (defaultCategories.blog || []).map((cat: any) => ({
      ...cat,
      type: "blog",
    }));
    const videoCategories = (defaultCategories.video || defaultCategories.watch || []).map(
      (cat: any) => ({
        ...cat,
        type: "video",
      })
    );

    const all = [...blogCategories, ...videoCategories];

    for (const cat of all) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          title: cat.title,
          description: cat.description,
          menuDescription: cat.menuDescription || "",
          accessibleLabel: cat.accessibleLabel,
          icon: cat.icon,
          order: cat.order,
          isActive: cat.isActive,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
          canonicalUrl: cat.canonicalUrl,
          robots: cat.robots,
          ogTitle: cat.ogTitle,
          ogDescription: cat.ogDescription,
          ogUrl: cat.ogUrl,
          ogType: cat.ogType,
          ogSiteName: cat.ogSiteName,
          ogImages: cat.ogImages,
          twitterCard: cat.twitterCard,
          twitterSite: cat.twitterSite,
          twitterTitle: cat.twitterTitle,
          twitterDescription: cat.twitterDescription,
          twitterImages: cat.twitterImages,
          schema: cat.schema,
          type: cat.type,
        },
        create: {
          id: cat.id,
          slug: cat.slug,
          title: cat.title,
          description: cat.description,
          menuDescription: cat.menuDescription || "",
          accessibleLabel: cat.accessibleLabel,
          icon: cat.icon,
          order: cat.order,
          isActive: cat.isActive,
          postCount: cat.postCount || 0,
          metaTitle: cat.metaTitle,
          metaDescription: cat.metaDescription,
          canonicalUrl: cat.canonicalUrl,
          robots: cat.robots,
          ogTitle: cat.ogTitle,
          ogDescription: cat.ogDescription,
          ogUrl: cat.ogUrl,
          ogType: cat.ogType,
          ogSiteName: cat.ogSiteName,
          ogImages: cat.ogImages,
          twitterCard: cat.twitterCard,
          twitterSite: cat.twitterSite,
          twitterTitle: cat.twitterTitle,
          twitterDescription: cat.twitterDescription,
          twitterImages: cat.twitterImages,
          schema: cat.schema,
          type: cat.type,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Categories synced from JSON.",
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync categories" },
      { status: 500 }
    );
  }
}