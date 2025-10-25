import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { HttpError } from "@/lib/http";
import {
  ensureFreshMediaUrl,
  extractMediaIds,
  linkMediaToPost,
  unlinkMediaFromPost,
} from "@/lib/media";
import type { BlogPost } from "@/lib/types";
import { ensureHtmlContent } from "@/lib/html-content";

export type { BlogPost };

const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: "fallback-building-developer-velocity",
    title: "How We Build Developer Velocity Without Burning Out",
    slug: "build-developer-velocity-without-burnout",
    content:
      "<p>Our platform team invests in small automation wins every sprint, from linting rules to release previews. Those compounding improvements give product engineers confidence to ship fast while keeping the on-call rotation calm.</p>",
    excerpt:
      "Practical rituals and tooling that help our engineers move quickly while protecting focus time and quality.",
    status: "published",
    category: "Engineering",
    categories: ["Engineering", "Culture"],
    tags: ["developer-experience", "process", "team"],
    featuredImage: "/placeholder.png",
    featured: true,
    seoTitle: "Build Developer Velocity Without Burnout",
    seoDescription:
      "Discover how our engineering team balances rapid delivery with sustainable practices across tooling, rituals, and culture.",
    author: "Platform Team",
    publishedAt: "2024-01-15T09:00:00.000Z",
    createdAt: "2024-01-10T09:00:00.000Z",
    updatedAt: "2024-01-15T09:00:00.000Z",
    views: 328,
    readTime: "6 min",
    commentCount: 4,
    shareCount: 12,
    schemaType: "Article",
    openGraphImage: "/placeholder.png",
  },
  {
    id: "fallback-product-analytics-north-star",
    title: "Designing a North-Star Metric for SaaS Onboarding",
    slug: "designing-north-star-metric-saas-onboarding",
    content:
      "<p>When our activation rate stalled, we paired product analytics with qualitative interviews to shape a north-star metric. It now guides weekly prioritisation and keeps growth experiments aligned with customer value.</p>",
    excerpt:
      "A step-by-step look at how we combined product analytics and research to define the activation signal that matters most.",
    status: "published",
    category: "Product",
    categories: ["Product", "Growth"],
    tags: ["analytics", "north-star", "saas"],
    featuredImage: "/placeholder.png",
    seoTitle: "Design a North-Star Metric for SaaS Onboarding",
    seoDescription:
      "See the framework we used to craft a meaningful activation metric, align stakeholders, and improve onboarding decisions.",
    author: "Product Analytics",
    publishedAt: "2023-11-03T12:00:00.000Z",
    createdAt: "2023-10-28T12:00:00.000Z",
    updatedAt: "2023-11-05T08:30:00.000Z",
    views: 512,
    readTime: "8 min",
    commentCount: 7,
    shareCount: 21,
    schemaType: "Article",
    openGraphImage: "/placeholder.png",
  },
];

function normalizeCategories(
  categories: unknown,
  fallback: unknown,
): string[] {
  const normalized = (Array.isArray(categories) ? categories : [])
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  if (typeof fallback === "string") {
    const trimmed = fallback.trim();
    if (trimmed.length > 0) {
      return [trimmed];
    }
  }

  return [];
}

const normalizeBlogPost = (post: BlogPost): BlogPost => {
  const categories = normalizeCategories(post.categories, post.category);
  const providedCategory =
    typeof post.category === "string" ? post.category.trim() : "";
  const category =
    providedCategory.length > 0 ? providedCategory : categories[0] ?? "";

  return {
    ...post,
    content: ensureHtmlContent(post.content),
    scheduledFor:
      typeof post.scheduledFor === "string" && post.scheduledFor.trim().length > 0
        ? post.scheduledFor
        : undefined,
    categories,
    category,
    commentCount: typeof post.commentCount === "number" ? post.commentCount : 0,
    shareCount: typeof post.shareCount === "number" ? post.shareCount : 0,
  };
};

const FALLBACK_MARKER = Symbol("content-store:fallback");

type FallbackMarkable = { [FALLBACK_MARKER]?: boolean };

function attachFallbackMarker<T>(value: T): T {
  if (value && typeof value === "object") {
    const target = value as FallbackMarkable;
    if (!Object.prototype.hasOwnProperty.call(target, FALLBACK_MARKER)) {
      Object.defineProperty(target, FALLBACK_MARKER, {
        value: true,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    } else {
      target[FALLBACK_MARKER] = true;
    }
  }
  return value;
}

function cloneFallbackPosts(): BlogPost[] {
  return FALLBACK_BLOG_POSTS.map((post) => normalizeBlogPost({ ...post }));
}

function fallbackCollection(): BlogPost[] {
  return attachFallbackMarker(cloneFallbackPosts());
}

function fallbackById(id: string): BlogPost | null {
  const fallbackPost = FALLBACK_BLOG_POSTS.find((post) => post.id === id);
  return fallbackPost
    ? attachFallbackMarker(normalizeBlogPost({ ...fallbackPost }))
    : null;
}

function fallbackBySlug(slug: string): BlogPost | null {
  const fallbackPost = FALLBACK_BLOG_POSTS.find((post) => post.slug === slug);
  return fallbackPost
    ? attachFallbackMarker(normalizeBlogPost({ ...fallbackPost }))
    : null;
}

export function isFallbackResult(value: unknown): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as FallbackMarkable)[FALLBACK_MARKER] === true,
  );
}

export function getFallbackBlogPosts(): BlogPost[] {
  return fallbackCollection();
}

export function getFallbackBlogPostBySlug(slug: string): BlogPost | null {
  return fallbackBySlug(slug);
}

export function getFallbackBlogPostById(id: string): BlogPost | null {
  return fallbackById(id);
}

async function applyFreshMediaToPosts(posts: BlogPost[]): Promise<BlogPost[]> {
  if (posts.length === 0) return posts;

  const idToUrl = new Map<string, string>();
  for (const post of posts) {
    const candidates = [post.featuredImage, post.openGraphImage];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const [id] = extractMediaIds(candidate);
      if (id && !idToUrl.has(id)) {
        idToUrl.set(id, candidate);
      }
    }
  }

  if (idToUrl.size === 0) return posts;

  const replacements = new Map<string, string>();
  await Promise.all(
    Array.from(idToUrl.entries()).map(async ([id, currentUrl]) => {
      const refreshed = await ensureFreshMediaUrl(currentUrl);
      if (typeof refreshed === "string") {
        replacements.set(id, refreshed);
      }
    }),
  );

  if (replacements.size === 0) return posts;

  return posts.map((post) => {
    let changed = false;
    const next: BlogPost = { ...post };

    const updateField = (field: "featuredImage" | "openGraphImage") => {
      const value = post[field];
      if (!value) return;
      const [mediaId] = extractMediaIds(value);
      if (!mediaId) return;
      const replacement = replacements.get(mediaId);
      if (replacement && replacement !== value) {
        next[field] = replacement;
        changed = true;
      }
    };

    updateField("featuredImage");
    updateField("openGraphImage");

    return changed ? next : post;
  });
}

/**
 * Retrieve the Firebase Admin Firestore instance or return `null` if the
 * admin client has not been initialised. This lets callers gracefully handle
 * preview environments where `FIREBASE_SERVICE_ACCOUNT_KEY` is not provided.
 */
function getDbOrNull(): Firestore | null {
  try {
    return getAdminDb();
  } catch (err) {
    if (
      process.env.ADMIN_BYPASS === "true" ||
      process.env.TEST_MODE === "true"
    ) {
      // Avoid noisy error logs in bypass or test modes
      console.debug("Firebase Admin Firestore unavailable:", err);
    } else {
      console.error("Firebase Admin Firestore unavailable:", err);
    }
    return null;
  }
}

export const ADMIN_DB_UNAVAILABLE =
  "Admin Firestore unavailable. Set FIREBASE_SERVICE_ACCOUNT_KEY.";

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
  categories?: string[];
  tags?: string[];
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
  featured: z.boolean().optional(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  scheduledFor: z.string().optional(),
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
  categories: z.array(z.string()).optional(),
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
    if (!db)
      return applyFreshMediaToPosts(FALLBACK_BLOG_POSTS.map(normalizeBlogPost));
    const snap = await db.collection("blogs").orderBy("createdAt", "desc").get();
    const posts = snap.docs.map((d) => normalizeBlogPost(d.data() as BlogPost));
    return applyFreshMediaToPosts(posts);
  },

  async getById(id: string): Promise<BlogPost | null> {
    const db = getDbOrNull();
    if (!db) {
      const fallbackPost = FALLBACK_BLOG_POSTS.find((post) => post.id === id);
      if (!fallbackPost) return null;
      const [post] = await applyFreshMediaToPosts([normalizeBlogPost(fallbackPost)]);
      return post ?? null;
    }
    const doc = await db.collection("blogs").doc(id).get();
    if (!doc.exists) return null;
    const [post] = await applyFreshMediaToPosts([
      normalizeBlogPost(doc.data() as BlogPost),
    ]);
    return post ?? null;
  },

  // Fetch a post by slug for edit/preview workflows
  async getBySlug(slug: string): Promise<BlogPost | null> {
    const db = getDbOrNull();
    if (!db) {
      const fallbackPost = FALLBACK_BLOG_POSTS.find((post) => post.slug === slug);
      if (!fallbackPost) return null;
      const [post] = await applyFreshMediaToPosts([normalizeBlogPost(fallbackPost)]);
      return post ?? null;
    }
    const snap = await db
      .collection("blogs")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const [post] = await applyFreshMediaToPosts([
      normalizeBlogPost(snap.docs[0].data() as BlogPost),
    ]);
    return post ?? null;
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
    if (newPost.scheduledFor === undefined) {
      delete (newPost as Partial<BlogPost>).scheduledFor;
    }
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

    const serverUpdate: Partial<BlogPost> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (serverUpdate.scheduledFor === undefined) {
      delete serverUpdate.scheduledFor;
    }
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

    return normalizeBlogPost(updated);
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
