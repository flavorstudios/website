export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
  readTime?: string;
  views?: number;
  featured?: boolean;
  commentCount?: number;
  shareCount?: number; // <-- Added for share metrics, default 0 if missing
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
