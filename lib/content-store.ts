// lib/content-store.ts
import { adminDb } from "@/lib/firebase-admin";

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

  async create(
    post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "views">
  ): Promise<BlogPost> {
    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newPost: BlogPost = {
      ...post,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    };
    await adminDb.collection("blogs").doc(id).set(newPost);
    return newPost;
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const ref = adminDb.collection("blogs").doc(id);
    await ref.set({ ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return doc.exists ? (doc.data() as BlogPost) : null;
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

  async create(
    video: Omit<Video, "id" | "createdAt" | "updatedAt" | "views">
  ): Promise<Video> {
    const id = `video_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newVideo: Video = {
      ...video,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    };
    await adminDb.collection("videos").doc(id).set(newVideo);
    return newVideo;
  },

  async update(id: string, updates: Partial<Video>): Promise<Video | null> {
    const ref = adminDb.collection("videos").doc(id);
    await ref.set({ ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return doc.exists ? (doc.data() as Video) : null;
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

/* ----- System Stats ----- */
export const systemStore = {
  async getStats(): Promise<SystemStats> {
    const [blogs, videos, comments] = await Promise.all([
      adminDb.collection("blogs").get(),
      adminDb.collection("videos").get(),
      adminDb.collectionGroup("entries").get(),
    ]);

    return {
      totalPosts: blogs.size,
      totalVideos: videos.size,
      totalComments: comments.size,
      pendingComments: comments.docs.filter((d) => d.data().status === "pending").length,
      totalViews:
        blogs.docs.reduce((sum, d) => sum + (d.data().views || 0), 0) +
        videos.docs.reduce((sum, d) => sum + (d.data().views || 0), 0),
      lastBackup: "Never",
      storageUsed: "Firestore",
    };
  },
};
