export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count?: number
}

// Always fetch categories from API/Prisma. No hardcoded fallback.
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/admin/categories", {
      cache: "no-store",
    })

    if (response.ok) {
      const categories = await response.json()
      return Array.isArray(categories) ? categories : []
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories from Prisma:", error)
  }
  // No fallback: return empty array if fetch fails.
  return []
}

// This is now deprecated and will always return empty.
// If any component uses getStaticCategories, update it to use getDynamicCategories instead.
export function getStaticCategories(): Category[] {
  return []
}
