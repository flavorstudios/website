// types/category.ts

export interface Category {
  id: string;
  title: string;        // Primary name for DB/storage, always present
  name: string;         // Alias for dashboard/UI compatibility
  slug: string;
  type: "blog" | "video";
  order: number;
  isActive: boolean;
  postCount: number;

  // Optional fields for UX and branding
  description?: string | null;
  tooltip?: string | null;
  color?: string | null;
  icon?: string | null;

  // Audit/meta fields
  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown; // Forward compatibility
}
