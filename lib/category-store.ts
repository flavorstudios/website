import { promises as fs } from "fs";
import path from "path";

// Category file config
const DATA_DIR = path.join(process.cwd(), "content-data");
const CATEGORY_FILE = "categories.json";

export type CategorySection = "blog" | "video" | "watch"; // You can use "video" OR "watch" for flexibility

export interface Category {
  slug: string;
  title: string;
  meta: any;
  openGraph: any;
  twitter: any;
  schema: any;
  icon: string;
  accessibleLabel: string;
  order?: number;
  isActive?: boolean;
}

// --- UTILS ---

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile() {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, CATEGORY_FILE);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return empty structure if file not found
    return { blog: [], video: [] };
  }
}

async function writeJsonFile(data: any) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, CATEGORY_FILE);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// --- MAIN CATEGORY STORE ---

export const categoryStore = {
  // Get all categories (both blog & video)
  async getAll(): Promise<{ blog: Category[]; video: Category[] }> {
    const all = await readJsonFile();
    // Normalize for both keys (video/watch)
    if (!all.video && all.watch) all.video = all.watch;
    if (!all.watch && all.video) all.watch = all.video;
    return {
      blog: Array.isArray(all.blog) ? all.blog : [],
      video: Array.isArray(all.video) ? all.video : [],
    };
  },

  // Get categories by type (blog or video)
  async getByType(type: CategorySection): Promise<Category[]> {
    const all = await this.getAll();
    const key = type === "blog" ? "blog" : "video";
    return Array.isArray(all[key]) ? all[key].filter((c) => c.isActive !== false) : [];
  },

  // Get category by slug
  async getBySlug(type: CategorySection, slug: string): Promise<Category | undefined> {
    const cats = await this.getByType(type);
    return cats.find((cat) => cat.slug === slug);
  },

  // Get by accessibleLabel (for accessibility)
  async getByAccessibleLabel(type: CategorySection, label: string): Promise<Category | undefined> {
    const cats = await this.getByType(type);
    return cats.find((cat) => cat.accessibleLabel === label);
  },

  // Add new category
  async create(type: CategorySection, category: Omit<Category, "order" | "isActive">) {
    const all = await readJsonFile();
    const key = type === "blog" ? "blog" : "video";
    if (!all[key]) all[key] = [];
    const exists = all[key].find((cat: Category) => cat.slug === category.slug);
    if (exists) throw new Error(`Category with slug "${category.slug}" already exists`);
    all[key].push({ ...category, order: all[key].length, isActive: true });
    await writeJsonFile(all);
  },

  // Update a category by slug
  async update(type: CategorySection, slug: string, updates: Partial<Category>) {
    const all = await readJsonFile();
    const key = type === "blog" ? "blog" : "video";
    if (!all[key]) throw new Error(`No category section: ${type}`);
    const idx = all[key].findIndex((cat: Category) => cat.slug === slug);
    if (idx === -1) throw new Error(`Category with slug "${slug}" not found`);
    all[key][idx] = { ...all[key][idx], ...updates };
    await writeJsonFile(all);
    return all[key][idx];
  },

  // Delete a category by slug
  async delete(type: CategorySection, slug: string) {
    const all = await readJsonFile();
    const key = type === "blog" ? "blog" : "video";
    if (!all[key]) throw new Error(`No category section: ${type}`);
    all[key] = all[key].filter((cat: Category) => cat.slug !== slug);
    await writeJsonFile(all);
  },

  // Reorder categories (for drag-drop in admin UI)
  async reorder(type: CategorySection, slugs: string[]) {
    const cats = await this.getByType(type);
    // Sort by order of slugs array
    const newCats = slugs
      .map((slug, i) => {
        const c = cats.find((cat) => cat.slug === slug);
        return c ? { ...c, order: i } : null;
      })
      .filter(Boolean);
    const all = await readJsonFile();
    const key = type === "blog" ? "blog" : "video";
    all[key] = newCats;
    await writeJsonFile(all);
  },
};

// --- OPTIONAL: Initialize with default categories (admin/seed only) ---
export async function initializeDefaultCategories(defaultCategories: { blog: Category[]; video: Category[] }) {
  await writeJsonFile(defaultCategories);
}