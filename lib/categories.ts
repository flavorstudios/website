// types/category.ts or lib/categories.ts

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count?: number
  type?: string // Optional: for future filtering (e.g., "BLOG" or "VIDEO")
}

// Always fetch categories from API/Prisma – no hardcoded fallback.
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories", { // Update endpoint as per latest API design
      cache: "no-store",
    })

    if (response.ok) {
      // Supports both array and object (legacy and new API)
      const data = await response.json()

      if (Array.isArray(data)) {
        // Legacy: return as is
        return data
      }
      // New: flatten blog + video categories if returned as object
      if (data.blogCategories || data.videoCategories) {
        const blog = Array.isArray(data.blogCategories) ? data.blogCategories : []
        const video = Array.isArray(data.videoCategories) ? data.videoCategories : []
        return [...blog, ...video]
      }
      // Edge case: fallback
      return []
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories from Prisma:", error)
  }
  // No fallback: return empty array if fetch fails.
  return []
}

// Deprecated: Always returns empty.
// If any component uses getStaticCategories, update it to use getDynamicCategories instead.
export function getStaticCategories(): Category[] {
  return []
}
