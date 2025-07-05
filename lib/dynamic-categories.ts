export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// Utility functions
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug)
}

export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Main function: always tries to fetch from API (Prisma-backed)
export async function getDynamicCategories(): Promise<DynamicCategoriesResult> {
  let blogCategories: CategoryData[] = []
  let videoCategories: CategoryData[] = []

  try {
    // Fetch blog categories from API (should return array of categories from Prisma)
    const blogRes = await fetch("/api/admin/categories?type=blog", { cache: "no-store" })
    if (blogRes.ok) {
      const blogs = await blogRes.json()
      blogCategories = (Array.isArray(blogs) ? blogs : []).map((cat: any) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.postCount ?? cat.count ?? 0,
      }))
    }
  } catch (error) {
    console.warn("Failed to fetch blog categories from Prisma:", error)
  }

  try {
    // Fetch video categories from API (should return array of categories from Prisma)
    const videoRes = await fetch("/api/admin/categories?type=video", { cache: "no-store" })
    if (videoRes.ok) {
      const videos = await videoRes.json()
      videoCategories = (Array.isArray(videos) ? videos : []).map((cat: any) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.postCount ?? cat.count ?? 0,
      }))
    }
  } catch (error) {
    console.warn("Failed to fetch video categories from Prisma:", error)
  }

  return {
    blogCategories,
    videoCategories,
  }
}

// Alias for legacy compatibility
export const getDynamicCategoriesClient = getDynamicCategories
