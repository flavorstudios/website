import { FALLBACK_CATEGORIES } from "./data/fallback-categories";
import type { CategoryType, PublicCategory } from "./types";

export async function getCategories(type?: CategoryType | "all"): Promise<PublicCategory[]> {
  const normalizedType = type?.toLowerCase();
  const filtered = FALLBACK_CATEGORIES.filter((category) => {
    if (!normalizedType || normalizedType === "all") return true;
    return category.type === normalizedType;
  });
  return filtered.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    type: category.type,
    order: typeof category.order === "number" ? category.order : 0,
    isActive: category.isActive !== false,
  }));
}