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
  tags?: string[];
}

export interface PublicPostDetail extends PublicPostSummary {
  content: string;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  schemaType?: string;
  openGraphImage?: string;
}

export interface VideoRecord {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  categories?: string[];
  tags?: string[];
  thumbnail?: string;
  videoUrl?: string;
  youtubeId?: string;
  duration?: string;
  featured?: boolean;
  publishedAt?: string;
}

export interface PublicVideo {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  categories: string[];
  tags: string[];
  thumbnail?: string;
  videoUrl?: string;
  youtubeId?: string;
  duration?: string;
  featured?: boolean;
  publishedAt?: string;
}

export type CategoryType = "blog" | "video";

export interface CategoryRecord {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: CategoryType;
  order?: number;
  isActive?: boolean;
}

export interface PublicCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: CategoryType;
  order: number;
  isActive: boolean;
}

export interface CommentRecord {
  id: string;
  postId: string;
  postType: CategoryType;
  author: string;
  content: string;
  status: "approved" | "pending";
  createdAt: string;
}

export interface CreateCommentInput {
  postId: string;
  postType?: CategoryType;
  author: string;
  content: string;
}

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
}

export interface CareerSubmission {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  skills?: string;
  portfolio?: string;
  message?: string;
  createdAt: string;
}

export interface GetPostsFilters {
  author?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}