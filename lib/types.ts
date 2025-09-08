export interface PublicBlogSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  categories: string[];
  tags: string[];
  publishedAt: string;
  readTime?: string;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  commentCount: number;
  shareCount: number; // <-- Added for share metrics, default 0 if missing
}

export interface PublicBlogDetail extends PublicBlogSummary {
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  schemaType?: string;
  openGraphImage?: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  youtubeId?: string;
  thumbnail?: string;
  description?: string;
  category?: string;
  categories?: string[];
  tags?: string[];
  duration?: string;
  publishedAt?: string;
  featured?: boolean;
}
