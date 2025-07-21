// app/api/admin/categories/route.ts

import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto"; // For generating unique IDs

const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");

async function readJSON() {
  const data = await fs.readFile(CATEGORIES_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeJSON(newData: any) {
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(newData, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageCategories"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const typeParam = request.nextUrl?.searchParams?.get("type");
    const data = await readJSON();
    const blog = data.CATEGORIES.blog || [];
    const watch = data.CATEGORIES.watch || [];
    let categories;
    if (typeParam === "blog") categories = blog;
    else if (typeParam === "video") categories = watch;
    else categories = [...blog, ...watch];
    // Always map title -> name for dashboard compatibility
    categories = categories.map((c: any) => ({ ...c, name: c.title }));
    return NextResponse.json({ categories });
  } catch (error) {
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

    let arr;
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
    if (arr.some((cat: any) => cat.slug === slug)) {
      throw new Error("Category with this name/type already exists.");
    }

    const category = {
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
      // You can add additional fields here if your UI needs them
    };

    arr.push(category);
    await writeJSON(json);

    // Always include name for dashboard compatibility
    return NextResponse.json({ category: { ...category, name: category.title } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 400 }
    );
  }
}
