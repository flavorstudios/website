// app/api/admin/categories/route.ts

import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto"; // For generating unique IDs

// Unified Category type import
import type { Category } from "@/types/category";

const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");

async function readJSON() {
  const data = await fs.readFile(CATEGORIES_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeJSON(newData: unknown) {
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(newData, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageCategories"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const typeParam = request.nextUrl?.searchParams?.get("type");
    const data = await readJSON();
    const blog = (data.CATEGORIES.blog || []).map((c: Record<string, unknown>) => ({
      ...c,
      name: c.title,
    })) as Category[];
    const watch = (data.CATEGORIES.watch || []).map((c: Record<string, unknown>) => ({
      ...c,
      name: c.title,
    })) as Category[];
    let categories: Category[];
    if (typeParam === "blog") categories = blog;
    else if (typeParam === "video") categories = watch;
    else categories = [...blog, ...watch];
    // Always map title -> name for dashboard compatibility (already done above)
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageCategories"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    // Accept dashboard sending `name` and map to title
    if (data.name && !data.title) {
      data.title = data.name;
    }
    const json = await readJSON();

    let arr: Record<string, unknown>[];
    if (data.type === "blog") arr = json.CATEGORIES.blog;
    else if (data.type === "video") arr = json.CATEGORIES.watch;
    else throw new Error("Invalid category type");

    // Slugify name if not provided
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check for duplicate (slug, type)
    if (arr.some((cat: Record<string, unknown>) => (cat as { slug: string }).slug === slug)) {
      throw new Error("Category with this name/type already exists.");
    }

    const categoryRecord: Record<string, unknown> = {
      id: crypto.randomUUID(),
      title: data.title,
      slug,
      type: data.type,
      description: data.description || "",
      tooltip: data.tooltip || "",
      color: data.color || null,
      icon: data.icon || null,
      order: typeof data.order === "number" ? data.order : 0,
      isActive: data.isActive !== false,
      postCount: 0,
      // Add other fields if required
    };

    arr.push(categoryRecord);
    await writeJSON(json);

    // Always include name for dashboard compatibility
    return NextResponse.json({ category: { ...categoryRecord, name: categoryRecord.title } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
