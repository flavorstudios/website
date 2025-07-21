// app/api/admin/categories/sync/route.ts

import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to your main categories file
const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");
// (Optional) Path to a default categories template/backup file
const DEFAULT_CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories-default.json");

async function categoriesExist() {
  try {
    const file = await fs.readFile(CATEGORIES_PATH, "utf-8");
    const data = JSON.parse(file);
    // Consider categories exist if at least one exists in blog or watch
    return (
      Array.isArray(data?.CATEGORIES?.blog) && data.CATEGORIES.blog.length > 0 ||
      Array.isArray(data?.CATEGORIES?.watch) && data.CATEGORIES.watch.length > 0
    );
  } catch {
    return false;
  }
}

async function restoreDefaultCategories() {
  const defaultFile = await fs.readFile(DEFAULT_CATEGORIES_PATH, "utf-8");
  await fs.writeFile(CATEGORIES_PATH, defaultFile, "utf-8");
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Restore categories.json from default if none exist
    if (!(await categoriesExist())) {
      await restoreDefaultCategories();
    }
    // (Optional) You can call updatePostCounts here if you implement it
    // For now, we just confirm the file is there and valid

    return NextResponse.json({
      success: true,
      message: "Categories synced successfully from JSON",
    });
  } catch (error) {
    console.error("Category sync error:", error);
    return NextResponse.json({ error: "Failed to sync categories" }, { status: 500 });
  }
}
