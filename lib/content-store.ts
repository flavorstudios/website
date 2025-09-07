import { getAdminDb } from "@/lib/firebase-admin";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { HttpError } from "@/lib/http";
import { extractMediaIds, linkMediaToPost, unlinkMediaFromPost } from "@/lib/media";

/**
 * Retrieve the Firebase Admin Firestore instance or return `null` if the
 * admin client has not been initialised. This lets callers gracefully handle
 * preview environments where `FIREBASE_SERVICE_ACCOUNT_KEY` is not provided.
 */
function getDbOrNull(): Firestore | null {
  try {
    return getAdminDb();
  } catch (err) {
    console.error("Firebase Admin Firestore unavailable:", err);
    return null;
  }
}

export const ADMIN_DB_UNAVAILABLE =
  "Admin Firestore unavailable. Set FIREBASE_SERVICE_ACCOUNT_KEY.";

// --- Interfaces (with commentCount, multi-category, etc.) ---
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  category: string;
  categories?: string[];      // <--- Codex: allow multiple categories
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
  commentCount?: number;      // <--- Codex: comment count for API/UI
  shareCount?: number;        // <--- Track how often a post is shared
  schemaType?: string;        // <--- ADDED for SEO & preview
  openGraphImage?: string;    // <--- ADDED for SEO & preview
}

export type BlogDiff = {
  [K in keyof BlogPost]?: { before: BlogPost[K]; after: BlogPost[K] };
};

export interface BlogRevision {
  id: string;
  timestamp: string;
  author: string;
  diff: BlogDiff;
}

export interface Video {
  id: string;
  slug: string; // <--- ADDED
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
  content: Record<string, unknown>;
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

// --- Zod Schemas for validation (unchanged, but can add commentCount if you wish) ---
export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  status: z.enum(["draft", "published", "scheduled"]),
  category: z.string(),
  categories: z.array(z.string()).optional(),    // <--- Codex: optional
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
  commentCount: z.number().optional(),           // <--- Codex: optional
  shareCount: z.number().optional(),             // <--- Track shares
  schemaType: z.string().optional(),             // <--- ADDED for SEO & preview
  openGraphImage: z.string().optional(),         // <--- ADDED for SEO & preview
});

export const VideoSchema = z.object({
  id: z.string(),
  slug: z.string(), // <--- ADDED
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

// --- Blog Store ---
export const blogStore = {
  async getAll(): Promise<BlogPost[]> {
    const db = getDbOrNull();
    if (!db) return [];
    const snap = await db.collection("blogs").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => {
      const doc = d.data() as BlogPost;
      return {
        ...doc,
        categories: Array.isArray(doc.categories) && doc.categories.length > 0 ? doc.categories : [doc.category],
        commentCount: typeof doc.commentCount === "number" ? doc.commentCount : 0, // always present
        shareCount: typeof doc.shareCount === "number" ? doc.shareCount : 0,       // always present
      };
    });
  },

  async getById(id: string): Promise<BlogPost | null> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    const doc = await db.collection("blogs").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as BlogPost;
    return {
      ...data,
      categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : [data.category],
      commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
      shareCount: typeof data.shareCount === "number" ? data.shareCount : 0,
    };
  },

  // Fetch a post by slug for edit/preview workflows
  async getBySlug(slug: string): Promise<BlogPost | null> {
    const db = getDbOrNull();
    if (!db) return null;
    const snap = await db
      .collection("blogs")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0].data() as BlogPost;
    return {
      ...data,
      categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : [data.category],
      commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
      shareCount: typeof data.shareCount === "number" ? data.shareCount : 0,
    };
  },

  async create(
    post: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "views" | "commentCount" | "shareCount">
  ): Promise<BlogPost> {
    // Validate input (omitting auto fields)
    const data = BlogPostSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      commentCount: true,
      shareCount: true,
    }).parse(post);

    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newPost: BlogPost = {
      ...post,
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      commentCount: 0,
      shareCount: 0,
    };
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    await db.collection("blogs").doc(id).set(newPost);
    try {
      const ids = extractMediaIds(
        newPost.content,
        newPost.featuredImage,
        newPost.openGraphImage
      );
      await linkMediaToPost(ids, id);
    } catch {
      /* ignore linking errors */
    }
    return newPost;
  },

  async update(
    id: string,
    updates: Partial<BlogPost>,
    editor = "unknown"
  ): Promise<BlogPost | null> {
    // Validate input (partial allows patching)
    const data = BlogPostSchema.partial().parse(updates);
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    const ref = db.collection("blogs").doc(id);

    const beforeSnap = await ref.get();
    if (!beforeSnap.exists) return null;
    const before = beforeSnap.data() as BlogPost;

    const serverUpdate = { ...data, updatedAt: new Date().toISOString() };
    await ref.set(serverUpdate, { merge: true });

    const afterSnap = await ref.get();
    if (!afterSnap.exists) return null;
    const updated = afterSnap.data() as BlogPost;

    try {
      const beforeIds = extractMediaIds(
        before.content,
        before.featuredImage,
        before.openGraphImage
      );
      const afterIds = extractMediaIds(
        updated.content,
        updated.featuredImage,
        updated.openGraphImage
      );
      const toAdd = afterIds.filter((m) => !beforeIds.includes(m));
      const toRemove = beforeIds.filter((m) => !afterIds.includes(m));
      await Promise.all([
        linkMediaToPost(toAdd, id),
        unlinkMediaFromPost(toRemove, id),
      ]);
    } catch {
      /* ignore linking errors */
    }

    // Field-level diff only for keys we attempted to change
    const diff: BlogDiff = {};
    const setDiff = <K extends keyof BlogPost>(key: K, beforeVal: BlogPost[K], afterVal: BlogPost[K]) => {
      diff[key] = { before: beforeVal, after: afterVal } as BlogDiff[K];
    };
    for (const key of Object.keys(data) as (keyof BlogPost)[]) {
      if (before[key] !== updated[key]) {
        setDiff(key, before[key], updated[key]);
      }
    }

    if (Object.keys(diff).length > 0) {
      await ref.collection("revisions").add({
        timestamp: new Date().toISOString(),
        author: editor,
        diff,
      });
    }

    return {
      ...updated,
      categories: Array.isArray(updated.categories) && updated.categories.length > 0 ? updated.categories : [updated.category],
      commentCount: typeof updated.commentCount === "number" ? updated.commentCount : 0,
      shareCount: typeof updated.shareCount === "number" ? updated.shareCount : 0,
    };
  },

  async getRevisions(id: string): Promise<BlogRevision[]> {
    const db = getDbOrNull();
    if (!db) return [];
    const snap = await db
      .collection("blogs")
      .doc(id)
      .collection("revisions")
      .orderBy("timestamp", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogRevision, "id">) }));
  },

  async restoreRevision(
    id: string,
    revisionId: string,
    editor = "unknown"
  ): Promise<BlogPost | null> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    const ref = db.collection("blogs").doc(id);
    const revDoc = await ref.collection("revisions").doc(revisionId).get();
    if (!revDoc.exists) return null;

    const revision = revDoc.data() as BlogRevision;

    // Build updates by reverting each changed field back to its "before" value
    const updates: Partial<BlogPost> = {};
    const setUpdate = <K extends keyof BlogPost>(key: K, value: BlogPost[K]) => {
      updates[key] = value;
    };
    for (const key of Object.keys(revision.diff) as (keyof BlogPost)[]) {
      const change = revision.diff[key];
      if (change) setUpdate(key, change.before);
    }

    // Apply update (this will also write a new revision entry via blogStore.update)
    const post = await blogStore.update(id, updates, editor);
    if (!post) return null;

    // Optional: also log a restore action entry for extra audit clarity
    const reverseDiff: BlogDiff = {};
    const setReverse = <K extends keyof BlogPost>(key: K, beforeVal: BlogPost[K], afterVal: BlogPost[K]) => {
      reverseDiff[key] = { before: beforeVal, after: afterVal } as BlogDiff[K];
    };
    for (const key of Object.keys(revision.diff) as (keyof BlogPost)[]) {
      const change = revision.diff[key];
      if (change) setReverse(key, change.after, change.before);
    }
    await ref.collection("revisions").add({
      timestamp: new Date().toISOString(),
      author: editor,
      diff: reverseDiff,
      action: "restore",
      fromRevisionId: revisionId,
    });

    return post;
  },

  async incrementViews(id: string): Promise<void> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    await db
      .collection("blogs")
      .doc(id)
      .update({ views: FieldValue.increment(1) });
  },

  async setCommentCount(id: string, count: number): Promise<void> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    await db
      .collection("blogs")
      .doc(id)
      .update({ commentCount: count });
  },

  async delete(id: string): Promise<boolean> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    const ref = db.collection("blogs").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    const data = doc.data() as BlogPost;
    try {
      const ids = extractMediaIds(
        data.content,
        data.featuredImage,
        data.openGraphImage
      );
      await unlinkMediaFromPost(ids, id);
    } catch {
      /* ignore */
    }
    await ref.delete();
    return true;
  },
};

// --- Video Store ---
export const videoStore = {
  async getAll(): Promise<Video[]> {
    const db = getDbOrNull();
    if (!db) return [];
    const snap = await db.collection("videos").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as Video);
  },

  async getById(id: string): Promise<Video | null> {
    const db = getDbOrNull();
    if (!db) return null;
    const doc = await db.collection("videos").doc(id).get();
    return doc.exists ? (doc.data() as Video) : null;
  },

  async getBySlug(slug: string): Promise<Video | null> {
    const db = getDbOrNull();
    if (!db) return null;
    const snap = await db
      .collection("videos")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    return snap.empty ? null : (snap.docs[0].data() as Video);
  },

  async create(
    video: Omit<Video, "id" | "createdAt" | "updatedAt" | "views">
  ): Promise<Video> {
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
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    await db.collection("videos").doc(id).set(newVideo);
    return newVideo;
  },

  async update(id: string, updates: Partial<Video>): Promise<Video | null> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    const data = VideoSchema.partial().parse(updates);
    const ref = db.collection("videos").doc(id);
    await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return doc.exists ? (doc.data() as Video) : null;
  },

  async incrementViews(id: string): Promise<void> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    await db
      .collection("videos")
      .doc(id)
      .update({ views: FieldValue.increment(1) });
  },

  async delete(id: string): Promise<boolean> {
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    const ref = db.collection("videos").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },
};

// --- Page Store (unchanged) ---
export const pageStore = {
  async getAll(): Promise<PageContent[]> {
    const db = getDbOrNull();
    if (!db) return [];
    const snap = await db.collection("pages").get();
    return snap.docs.map((d) => d.data() as PageContent);
  },

  async update(
    page: string,
    section: string,
    content: Record<string, unknown>,
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
    const db = getDbOrNull();
    if (!db) throw new HttpError(ADMIN_DB_UNAVAILABLE, 503, "content-store");
    await db.collection("pages").doc(id).set(entry);
    return entry;
  },
};

// --- Codex: re-export commentStore and systemStore for central access ---
export { commentStore } from "./comment-store";
export { systemStore } from "./system-store";
