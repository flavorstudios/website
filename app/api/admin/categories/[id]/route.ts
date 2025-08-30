// app/api/admin/categories/[id]/route.ts

import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Category } from "@/types/category";
import { publishToUser } from "@/lib/sse-broker";

const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");

async function readJSON() {
  const data = await fs.readFile(CATEGORIES_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeJSON(newData: unknown) {
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(newData, null, 2), "utf-8");
}

// Type-safe payload validation
function isValidCategoryUpdate(data: unknown): data is Partial<Category> {
  return (
    typeof data === "object" &&
    data !== null &&
    ("name" in data || "title" in data)
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canManageCategories"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = context.params;
  try {
    const data = await request.json();

    if (!isValidCategoryUpdate(data)) {
      return NextResponse.json(
        { error: "Invalid category data" },
        { status: 400 }
      );
    }

    // Map dashboard `name` to `title` if needed
    if (data.name && !data.title) {
      data.title = data.name;
    }

    const json = await readJSON();

    let found = false;
    ["blog", "watch"].forEach((type) => {
      json.CATEGORIES[type] = json.CATEGORIES[type].map(
        (cat: Record<string, unknown>) => {
          if ((cat as { id: string }).id === id) {
            found = true;
            const rest = { ...data };
            delete rest.name;
            return {
              ...cat,
              ...rest,
              tooltip: rest.tooltip ?? (cat as { tooltip?: unknown }).tooltip,
              id: (cat as { id: string }).id,
              title: rest.title ?? (cat as { title?: string }).title,
            };
          }
          return cat;
        }
      );
    });

    if (!found) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await writeJSON(json);
    publishToUser("blog", "categories", {});

    // Return updated category with `name` for dashboard compatibility
    const updated = [
      ...json.CATEGORIES.blog,
      ...json.CATEGORIES.watch,
    ].find(
      (cat: Record<string, unknown>) =>
        (cat as { id: string }).id === id
    );
    return NextResponse.json({
      category: { ...updated, name: (updated as { title?: string }).title },
    });
  } catch (error: unknown) {
    // Improved error logging
    console.error("PUT /api/admin/categories/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!(await requireAdmin(request, "canManageCategories"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = context.params;
  try {
    const json = await readJSON();

    let removed = false;
    ["blog", "watch"].forEach((type) => {
      const origLength = json.CATEGORIES[type].length;
      json.CATEGORIES[type] = json.CATEGORIES[type].filter(
        (cat: Record<string, unknown>) =>
          (cat as { id: string }).id !== id
      );
      if (json.CATEGORIES[type].length !== origLength) {
        removed = true;
      }
    });

    if (!removed) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await writeJSON(json);
    publishToUser("blog", "categories", {});

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/admin/categories/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
