export interface Category {
  id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  postCount: number;
  type: "blog" | "video";
  tooltip?: string;
  [key: string]: unknown;
}
