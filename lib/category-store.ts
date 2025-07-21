// lib/category-store.ts

import fs from "fs/promises";
import path from "path";

const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");

export interface Category {
  id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  postCount: number;
  type: "blog" | "video";
  tooltip?: string;
  [key: string]: any;
}

export const categoryStore = {
  async readJSON() {
    const data = await fs.readFile(CATEGORIES_PATH, "utf-8");
    return JSON.parse(data);
  },
  async writeJSON(newData: any) {
    await fs.writeFile(CATEGORIES_PATH, JSON.stringify(newData, null, 2), "utf-8");
  },

  async getAll(): Promise<Category[]> {
    const data = await this.readJSON();
    return [...(data.CATEGORIES.blog || []), ...(data.CATEGORIES.watch || [])];
  },

  async getByType(type: "blog" | "video"): Promise<Category[]> {
    const data = await this.readJSON();
    return type === "blog" ? (data.CATEGORIES.blog || []) : (data.CATEGORIES.watch || []);
  },

  async getById(id: string): Promise<Category | null> {
    const data = await this.readJSON();
    const all = [...(data.CATEGORIES.blog || []), ...(data.CATEGORIES.watch || [])];
    return all.find((c) => c.id === id) || null;
  },

  async getBySlug(slug: string, type: "blog" | "video"): Promise<Category | null> {
    const data = await this.readJSON();
    const arr = type === "blog" ? (data.CATEGORIES.blog || []) : (data.CATEGORIES.watch || []);
    return arr.find((c) => c.slug === slug) || null;
  },

  async create(category: Omit<Category, "id" | "postCount">): Promise<Category> {
    const data = await this.readJSON();
    const arr = category.type === "blog" ? data.CATEGORIES.blog : data.CATEGORIES.watch;

    // Prevent duplicate slug/type
    if (arr.some((c: Category) => c.slug === category.slug)) {
      throw new Error(`Category "${category.title}" already exists for ${category.type}`);
    }

    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      postCount: 0,
    };

    arr.push(newCategory);
    await this.writeJSON(data);

    return newCategory;
  },

  async update(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category | null> {
    const data = await this.readJSON();
    let updated: Category | null = null;
    for (const type of ["blog", "watch"] as const) {
      const arr = data.CATEGORIES[type];
      const idx = arr.findIndex((c: Category) => c.id === id);
      if (idx !== -1) {
        arr[idx] = { ...arr[idx], ...updates };
        updated = arr[idx];
        break;
      }
    }
    if (updated) await this.writeJSON(data);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const data = await this.readJSON();
    let changed = false;
    for (const type of ["blog", "watch"] as const) {
      const arr = data.CATEGORIES[type];
      const idx = arr.findIndex((c: Category) => c.id === id);
      if (idx !== -1) {
        arr.splice(idx, 1);
        changed = true;
      }
    }
    if (changed) await this.writeJSON(data);
    return changed;
  },

  // Optional: Update postCount for dashboard/statistics — implement if you want
  async updatePostCounts(): Promise<void> {
    // You could calculate counts based on your blog/video sources, if desired
    return;
  },

  async reorder(categoryIds: string[], type: "blog" | "video"): Promise<void> {
    const data = await this.readJSON();
    const arr = data.CATEGORIES[type];
    // Sort by order of ids in categoryIds
    data.CATEGORIES[type] = categoryIds
      .map((id) => arr.find((c: Category) => c.id === id))
      .filter(Boolean)
      .map((c, idx) => ({ ...c, order: idx })) as Category[];
    await this.writeJSON(data);
  },
};

// (Optional) Initialize defaults — for dev/testing only. Not needed for live JSON-only setup.
export async function initializeDefaultCategories() {
  // NO-OP for JSON only; kept for API compatibility
  return;
}
