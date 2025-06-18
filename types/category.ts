// /types/category.ts

export type CategoryType = "blog" | "watch";

export interface Category {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: CategoryType; // "blog" or "watch"
  order: number;      // for sorting in the menu
  postCount: number;
  icon?: string;
  ogImage?: string;
  twitterImage?: string;
  meta?: {
    description?: string;
    canonicalUrl?: string;
    robots?: string;
  };
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    site_name?: string;
    images?: { url: string; width?: number; height?: number }[];
  };
  twitter?: {
    card?: string;
    site?: string;
    title?: string;
    description?: string;
    images?: string[];
  };
  schema?: any; // For flexibility, you can define a stricter type later if needed
  accessibleLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}