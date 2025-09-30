export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  category: string;
  categories?: string[];
  tags: string[];
  featuredImage: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  author: string;
  publishedAt: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  readTime?: string;
  commentCount?: number;
  shareCount?: number;
  schemaType?: string;
  openGraphImage?: string;
}

export type PublicBlogDetail = Omit<BlogPost, "status">;

export type PublicBlogSummary = Omit<
  PublicBlogDetail,
  "content" | "createdAt" | "updatedAt" | "schemaType" | "openGraphImage"
>;


export interface Video {
  id: string;
  title: string;
  slug: string;
  youtubeId?: string;
  thumbnail?: string;
  description?: string;
  category: string;
  categories?: string[];
  tags?: string[];
  duration?: string;
  publishedAt?: string;
  featured?: boolean;
}
