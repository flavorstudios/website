import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- GET: List all categories (for admin panel, grouped by type: blog/video) ---
export async function GET() {
  try {
    // Fetch all categories, order for menu
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    });

    // Group by type for convenience
    const grouped = {
      blog: categories.filter(c => c.type === "blog"),
      watch: categories.filter(c => c.type === "video"), // keep "watch" alias if needed elsewhere
    };

    return NextResponse.json({ categories: grouped });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// --- POST: Create a new category with all SEO/OG/Twitter fields ---
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Required: title, slug, type
    if (!data.title || !data.slug || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create with all fields (safe defaults for optional fields)
    const category = await prisma.category.create({
      data: {
        id: data.id, // allow custom UUID (optional)
        slug: data.slug,
        title: data.title,
        description: data.description || "",
        menuDescription: data.menuDescription || "",  // <--- Added!
        accessibleLabel: data.accessibleLabel || "",
        icon: data.icon || "",
        order: typeof data.order === "number" ? data.order : 0,
        isActive: typeof data.isActive === "boolean" ? data.isActive : true,
        postCount: typeof data.postCount === "number" ? data.postCount : 0,

        // SEO fields
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        canonicalUrl: data.canonicalUrl || "",
        robots: data.robots || "",

        // OG fields
        ogTitle: data.ogTitle || "",
        ogDescription: data.ogDescription || "",
        ogUrl: data.ogUrl || "",
        ogType: data.ogType || "",
        ogSiteName: data.ogSiteName || "",
        ogImages: data.ogImages || [],

        // Twitter fields
        twitterCard: data.twitterCard || "",
        twitterSite: data.twitterSite || "",
        twitterTitle: data.twitterTitle || "",
        twitterDescription: data.twitterDescription || "",
        twitterImages: data.twitterImages || [],

        // Schema (JSON-LD)
        schema: data.schema || {},

        // Blog/video type
        type: data.type,
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

// --- PATCH: Update a category by slug (all fields) ---
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.slug) {
      return NextResponse.json({ error: "Missing category slug" }, { status: 400 });
    }

    // Only update provided fields
    const updated = await prisma.category.update({
      where: { slug: data.slug },
      data: {
        title: data.title,
        description: data.description,
        menuDescription: data.menuDescription, // <--- Added!
        accessibleLabel: data.accessibleLabel,
        icon: data.icon,
        order: data.order,
        isActive: data.isActive,
        postCount: data.postCount,

        // SEO
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        robots: data.robots,

        // OG
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogUrl: data.ogUrl,
        ogType: data.ogType,
        ogSiteName: data.ogSiteName,
        ogImages: data.ogImages,

        // Twitter
        twitterCard: data.twitterCard,
        twitterSite: data.twitterSite,
        twitterTitle: data.twitterTitle,
        twitterDescription: data.twitterDescription,
        twitterImages: data.twitterImages,

        schema: data.schema,
        type: data.type,
      },
    });

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 400 }
    );
  }
}

// --- DELETE: Remove a category by slug (optional, for admin UI) ---
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.slug) {
      return NextResponse.json({ error: "Missing category slug" }, { status: 400 });
    }

    await prisma.category.delete({ where: { slug: data.slug } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 400 }
    );
  }
}