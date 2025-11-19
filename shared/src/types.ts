export interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "draft" | "published" | string;
  category?: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  author?: string | { id?: string; name?: string };
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  readTime?: string;
  commentCount?: number;
  shareCount?: number;
  schemaType?: string;
  openGraphImage?: string;
}

export interface PublicPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  featured: boolean;
  author?: string;
  publishedAt?: string;
  categories: string[];
  category: string;
  commentCount: number;
  shareCount: number;
  views?: number;
  readTime?: string;
}

export interface GetPostsFilters {
  author?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}