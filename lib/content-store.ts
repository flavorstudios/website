// lib/content-store.ts

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

/* Interfaces – unchanged */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  category: string;
  tags: string[];
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  readTime?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  featured?: boolean;
}

export interface PageContent {
  id: string;
  page: string;
  section: string;
  content: Record<string, any>;
  updatedAt: string;
  updatedBy: string;
}

export interface SystemStats {
  totalPosts: number;
  totalVideos: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  lastBackup: string;
  storageUsed: string;
}

// Zod schemas for validating BlogPost and Video objects
export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  status: z.enum(["draft", "published", "scheduled"]),
  category: z.string(),
  tags: z.array(z.string()),
  featuredImage: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  views: z.number(),
  readTime: z.string().optional(),
});

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  youtubeId: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  views: z.number(),
  featured: z.boolean().optional(),
});

/* ----- Blog Store ----- */
export const blogStore = {
  async getAll(): Promise<BlogPost[]> {
    const snap = await adminDb.collection("blogs").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as BlogPost);
  },

  async getById(id: string): Promise<BlogPost | null> {
    const doc = await adminDb.collection("blogs").doc(id).get();
    return doc.exists ? (doc.data() as BlogPost) : null;
  },

  // Codex addition: fetch a post by slug for edit/preview workflows
  async getBySlug(slug: string): Promise<BlogPost | null> {
    const snap = await adminDb
      .collection("blogs")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    return snap.empty ? null : (snap.docs[0].data() as BlogPost);
  },

  /**
   * Create a new blog post after validating input with BlogPostSchema.
   * Rejects invalid data.
   */
  async create(
    post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "views">
  ): Promise<BlogPost> {
    // Validate input (omitting auto fields)
    const data = BlogPostSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      views: true,
    }).parse(post);

    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newPost: BlogPost = {
      ...post,
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    };
    await adminDb.collection("blogs").doc(id).set(newPost);
    return newPost;
  },

  /**
   * Update a blog post after validating updates with BlogPostSchema.
   * Rejects invalid data.
   */
  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    // Validate input (partial allows patching)
    const data = BlogPostSchema.partial().parse(updates);
    const ref = adminDb.collection("blogs").doc(id);
    await ref.set({ ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return doc.exists ? (doc.data() as BlogPost) : null;
  },

  /** Increment the view counter for a blog post using Firestore's atomic increment. */
  async incrementViews(id: string): Promise<void> {
    await adminDb
      .collection("blogs")
      .doc(id)
      .update({ views: FieldValue.increment(1) });
  },

  async delete(id: string): Promise<boolean> {
    const ref = adminDb.collection("blogs").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },
};

/* ----- Video Store ----- */
export const videoStore = {
  async getAll(): Promise<Video[]> {
    const snap = await adminDb.collection("videos").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as Video);
  },

  async getById(id: string): Promise<Video | null> {
    const doc = await adminDb.collection("videos").doc(id).get();
    return doc.exists ? (doc.data() as Video) : null;
  },

  // (Optional but consistent): fetch video by slug
  async getBySlug(slug: string): Promise<Video | null> {
    const snap = await adminDb
      .collection("videos")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    return snap.empty ? null : (snap.docs[0].data() as Video);
  },

  /**
   * Create a new video after validating input with VideoSchema.
   * Rejects invalid data.
   */
  async create(
    video: Omit<Video, "id" | "createdAt" | "updatedAt" | "views">
  ): Promise<Video> {
    // Validate input (omitting auto fields)
    const data = VideoSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      views: true,
    }).parse(video);

    const id = `video_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newVideo: Video = {
      ...video,
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    };
    await adminDb.collection("videos").doc(id).set(newVideo);
    return newVideo;
  },

  /**
   * Update a video after validating updates with VideoSchema.
   * Rejects invalid data.
   */
  async update(id: string, updates: Partial<Video>): Promise<Video | null> {
    // Validate input (partial allows patching)
    const data = VideoSchema.partial().parse(updates);
    const ref = adminDb.collection("videos").doc(id);
    await ref.set({ ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return doc.exists ? (doc.data() as Video) : null;
  },

  /** Increment the view counter for a video using Firestore's atomic increment. */
  async incrementViews(id: string): Promise<void> {
    await adminDb
      .collection("videos")
      .doc(id)
      .update({ views: FieldValue.increment(1) });
  },

  async delete(id: string): Promise<boolean> {
    const ref = adminDb.collection("videos").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },
};

/* ----- Page Store ----- */
export const pageStore = {
  async getAll(): Promise<PageContent[]> {
    const snap = await adminDb.collection("pages").get();
    return snap.docs.map((d) => d.data() as PageContent);
  },

  async update(
    page: string,
    section: string,
    content: Record<string, any>,
    updatedBy: string
  ): Promise<PageContent> {
    const id = `${page}_${section}`;
    const entry: PageContent = {
      id,
      page,
      section,
      content,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    await adminDb.collection("pages").doc(id).set(entry);
    return entry;
  },
};
