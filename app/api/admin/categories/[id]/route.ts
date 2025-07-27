// app/api/admin/categories/[id]/route.ts

import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Unified Category type
import type { Category } from "@/types/category";

const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");

async function readJSON() {
  const data = await fs.readFile(CATEGORIES_PATH, "utf-8");
  return JSON.parse(data);
}
async function writeJSON(newData: unknown) {
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(newData, null, 2), "utf-8");
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    // Accept dashboard `name`, map to `title`
    if (data.name && !data.title) {
      data.title = data.name;
    }
    const json = await readJSON();

    // Find and update category by ID (both blog & watch arrays)
    let found = false;
    ["blog", "watch"].forEach((type) => {
      json.CATEGORIES[type] = json.CATEGORIES[type].map((cat: Record<string, unknown>) => {
        if ((cat as { id: string }).id === params.id) {
          found = true;
          // Only destructure ...rest, avoid unused `name`
          const { name: _name, ...rest } = data;
          return {
            ...cat,
            ...rest,
            tooltip: rest.tooltip ?? cat.tooltip,
            id: (cat as { id: string }).id,
            title: rest.title ?? (cat as { title?: string }).title,
          };
        }
        return cat;
      });
    });

    if (!found) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await writeJSON(json);

    // Return updated category with `name` for dashboard
    const updated = [...json.CATEGORIES.blog, ...json.CATEGORIES.watch].find(
      (cat: Record<string, unknown>) => (cat as { id: string }).id === params.id
    );
    return NextResponse.json({ category: { ...updated, name: (updated as { title?: string }).title } });
  } catch (error: unknown) {
    // Use type guard for error
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const json = await readJSON();

    // Remove category by ID (both blog & watch arrays)
    let removed = false;
    ["blog", "watch"].forEach((type) => {
      const origLength = json.CATEGORIES[type].length;
      json.CATEGORIES[type] = json.CATEGORIES[type].filter(
        (cat: Record<string, unknown>) => (cat as { id: string }).id !== params.id
      );
      if (json.CATEGORIES[type].length !== origLength) {
        removed = true;
      }
    });

    if (!removed) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await writeJSON(json);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
