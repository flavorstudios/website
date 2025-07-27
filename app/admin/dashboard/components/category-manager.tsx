"use client";

export { default as CategoryManager } from "@/components/admin/category/CategoryManager";
export type {
  CategoryListProps,
  CategoryType,
} from "@/components/admin/category/CategoryList";
export type { Category } from "@/types/category"; // Correct: Category type comes from types, not CategoryList
