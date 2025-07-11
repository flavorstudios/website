// /lib/dynamic-categories.ts

import { PrismaClient, CategoryType } from "@prisma/client"

// --- Category Data Interface ---
export interface CategoryData {
  name: string
  slug: string
  count: number
  tooltip?: string // Codex: support for tooltip
}

// --- Result Type for Dynamic Categories API ---
export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// --- Prisma Instance for Server-side (optional) ---
const prisma = typeof window === "undefined" ? new PrismaClient() : null

// --- Server Helpers (if you want direct DB access, e.g., in layout.tsx) ---
export async function getBlogCategories(): Promise<CategoryData[]> {
  if (!prisma) return []
  try {
    const categories = await prisma.category.findMany({
      where: { type: CategoryType.BLOG, isActive: true },
      orderBy: { order: "asc" },
      select: { name: true, slug: true, postCount: true, tooltip: true },
    })
    return categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.postCount ?? 0,
      tooltip: cat.tooltip ?? undefined,
    }))
  } catch (error) {
    console.warn("Failed to get blog categories:", error)
    return []
  }
}

export async function getVideoCategories(): Promise<CategoryData[]> {
  if (!prisma) return []
  try {
    const categories = await prisma.category.findMany({
      where: { type: CategoryType.VIDEO, isActive: true },
      orderBy: { order: "asc" },
      select: { name: true, slug: true, postCount: true, tooltip: true },
    })
    return categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.postCount ?? 0,
      tooltip: cat.tooltip ?? undefined,
    }))
  } catch (error) {
    console.warn("Failed to get video categories:", error)
    return []
  }
}

// --- Utility: Create slug from category name ---
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// --- Utility: Find category by slug ---
export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug)
}

// --- Utility: Format slug back to title-case name ---
export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Canonical: Fetch all blog and video categories from API (unified source of truth)
 * - Fetches from /api/categories which returns { blogCategories, videoCategories }
 * - Returns shape: { blogCategories: CategoryData[], videoCategories: CategoryData[] }
 * - If type is provided, returns only that type as CategoryData[]
 */
export async function getDynamicCategories(
  type?: "blog" | "video"
): Promise<DynamicCategoriesResult | CategoryData[]> {
  try {
    if (type === "blog") {
      // Fetch only blog categories
      const res = await fetch("/api/categories?type=blog", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch blog categories")
      const { categories } = await res.json()
      return Array.isArray(categories) ? categories : []
    }
    if (type === "video") {
      // Fetch only video categories
      const res = await fetch("/api/categories?type=video", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch video categories")
      const { categories } = await res.json()
      return Array.isArray(categories) ? categories : []
    }
    // Fetch both types
    const res = await fetch("/api/categories", { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch categories")
    const { blogCategories, videoCategories } = await res.json()
    return {
      blogCategories: Array.isArray(blogCategories) ? blogCategories : [],
      videoCategories: Array.isArray(videoCategories) ? videoCategories : [],
    }
  } catch (error) {
    console.warn("Failed to fetch categories from API:", error)
    if (type === "blog" || type === "video") return []
    return {
      blogCategories: [],
      videoCategories: [],
    }
  }
}

/**
 * Helper: Map categories to menu items for navigation
 * @param categories - Array of CategoryData (blog or video)
 * @param baseHref - Root path for this type ('/blog' or '/watch')
 * @param typeLabel - Label for description ('posts' or 'videos')
 * @returns Array of menu items: { label, href, description }
 */
export function mapToMenuItems(
  categories: CategoryData[],
  baseHref: string,
  typeLabel: string
) {
  return categories.map((category) => ({
    label: category.name,
    href: `${baseHref}?category=${category.slug}`,
    description: category.tooltip || `${category.name} ${typeLabel}${category.count > 0 ? ` (${category.count})` : ""}`,
  }))
}

// Aliases for backward compatibility
export const getDynamicCategoriesClient = getDynamicCategories
export const getCategoriesWithFallback = getDynamicCategories
