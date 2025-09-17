"use client";

import { useState, useEffect, useRef, useMemo, useCallback, useId } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BlogPostRenderer from "@/components/BlogPostRenderer";
import { RichTextEditor } from "./rich-text-editor";
import Image from "next/image";
import {
  Save, Eye, CalendarIcon, Upload, X, Clock, BookOpen, Tag, Settings, ArrowLeft, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { authors } from "@/lib/authors";
import { slugify } from "@/lib/slugify";
import MediaPickerDialog from "./media/MediaPickerDialog";
import type {
  BlogPost as StoreBlogPost,
  BlogRevision,
} from "@/lib/content-store";

export type BlogPost = Omit<
  StoreBlogPost,
  "publishedAt" | "createdAt" | "updatedAt" | "views" | "commentCount"
> & {
  categories: string[];
  publishedAt?: Date;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  commentCount?: number;
  seoKeywords: string;
  featured: boolean;
  wordCount: number;
  readTime: string;
  scheduledFor?: Date;
  shareCount?: number;
};

// NEW: autosave hook
import { useAutosave } from "@/hooks/useAutosave";
// User ID for per-user draft keys

const titleMin = 50;
const titleMax = 60;
const descMin = 120;
const descMax = 160;

function getLengthClass(length: number, min: number, max: number) {
  if (length === 0) return "text-gray-500";
  if (length < min) return "text-yellow-600";
  if (length > max) return "text-red-600";
  return "text-green-600";
}
function getLengthMessage(length: number, min: number, max: number) {
  if (length === 0) return `Recommended ${min}-${max} characters`;
  if (length < min) return `Too short – aim for ${min}-${max}`;
  if (length > max) return `Too long – aim for ${min}-${max}`;
  return "Perfect length";
}

export interface BlogCategory {
  name: string;
  slug: string;
  tooltip?: string;
}

// safe localStorage helpers were previously used for autosave persistence
// but are no longer needed. They have been removed to keep the bundle lean
// and to satisfy linting rules about unused variables.

export function BlogEditor({ initialPost }: { initialPost?: Partial<BlogPost> }) {
  const { toast } = useToast();
  const router = useRouter();
  // Using a fixed user ID since NextAuth is not in use
  const userId = "anon";
  const contentHeadingId = useId();

  const [post, setPost] = useState<BlogPost>(() => ({
    id: initialPost?.id ?? "",
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    content: initialPost?.content ?? "",
    excerpt: initialPost?.excerpt ?? "",
    category: initialPost?.category ?? "",
    categories: initialPost?.categories ?? (initialPost?.category ? [initialPost.category] : []),
    tags: initialPost?.tags ?? [],
    featuredImage: initialPost?.featuredImage ?? "",
    seoTitle: initialPost?.seoTitle ?? "",
    seoDescription: initialPost?.seoDescription ?? "",
    seoKeywords: initialPost?.seoKeywords ?? "",
    openGraphImage: initialPost?.openGraphImage ?? "",
    schemaType: (initialPost?.schemaType as any) ?? "Article",
    status: (initialPost?.status as BlogPost["status"]) ?? "draft",
    featured: initialPost?.featured ?? false,
    author: initialPost?.author ?? "Admin",
    wordCount: initialPost?.wordCount ?? 0,
    readTime: initialPost?.readTime ?? "1 min read",
    publishedAt: initialPost?.publishedAt ? new Date(initialPost.publishedAt) : undefined,
    scheduledFor: initialPost?.scheduledFor ? new Date(initialPost.scheduledFor) : undefined,
    createdAt: initialPost?.createdAt ?? new Date().toISOString(),
    updatedAt: initialPost?.updatedAt ?? new Date().toISOString(),
    views: initialPost?.views ?? 0,
    commentCount: initialPost?.commentCount ?? 0,
    shareCount: initialPost?.shareCount ?? 0,
  }));

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // New: revision history + ws state
  const [revisions, setRevisions] = useState<BlogRevision[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Draft persistence + dirty tracking + online awareness
  const draftKey = initialPost?.id ? `blog-editor-${initialPost.id}` : "blog-editor-new";
  const [isDirty, setIsDirty] = useState(false);
  const initialRender = useRef(true);
  const skipDraftRef = useRef(false);
  const [online, setOnline] = useState(true);

  // NEW: concurrency guard for saves
  const saveInFlight = useRef(false);

  // NEW: stable draft id for autosave route
  const draftIdRef = useRef(post.id || `draft-${Date.now()}`);

  // NEW: stable autosave payload to avoid unnecessary debounce cycles
  const autosaveData = useMemo(
    () => ({
      title: post.title,
      content: post.content,
      tags: post.tags,
      slug: post.slug,
    }),
    [post.title, post.content, post.tags, post.slug]
  );

  // NEW: wire autosave (IndexedDB offline, backoff, conflict-ready)
  const { status: autosaveStatus, savedAt: autosaveSavedAt } = useAutosave({
    userId,
    draftId: draftIdRef.current,
    data: autosaveData,
    // Optionally surface a conflict modal here by capturing the server copy:
    // onConflict: (server) => setConflict({ server }),
  });

  // Helper to combine scheduled date + time
  const getScheduledDateTime = useCallback(() => {
    if (!scheduledDate || !scheduledTime) return undefined;
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const dt = new Date(scheduledDate);
    if (!isNaN(hours)) dt.setHours(hours);
    if (!isNaN(minutes)) dt.setMinutes(minutes);
    dt.setSeconds(0, 0);
    return dt;
  }, [scheduledDate, scheduledTime]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories?type=blog", {
          credentials: "include",
        });
        const data = await response.json();
        const blogCategories: BlogCategory[] = Array.isArray(data.categories)
          ? data.categories.map((cat: BlogCategory) => ({
              name: cat.name,
              slug: cat.slug,
              tooltip: cat.tooltip ?? "",
            }))
          : [];
        setCategories(blogCategories);
        if (post.categories.length === 0 && blogCategories.length > 0) {
          setPost((prev) => ({
            ...prev,
            category: blogCategories[0].slug,
            categories: [blogCategories[0].slug],
          }));
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      }
    };
    loadCategories();

    // Online/offline awareness only (removed localStorage draft restore: handled by autosave hook via IndexedDB)
    if (typeof window !== "undefined") {
      const updateOnline = () => setOnline(navigator.onLine);
      updateOnline();
      window.addEventListener("online", updateOnline);
      window.addEventListener("offline", updateOnline);
      return () => {
        window.removeEventListener("online", updateOnline);
        window.removeEventListener("offline", updateOnline);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slug generation (improved)
  useEffect(() => {
    if (post.title && (!post.slug || post.slug === "")) {
      const s = slugify(post.title);
      if (s !== post.slug) setPost((prev) => ({ ...prev, slug: s }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.title]);

  // Auto-generate excerpt + derived fields (idempotent)
  useEffect(() => {
    const text = post.content.replace(/<[^>]*>/g, "");
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const wc = words.length;
    const rt = `${Math.max(1, Math.ceil(wc / 200))} min read`;
    const suggestedExcerpt = text.length > 160 ? text.substring(0, 160) + "..." : text;

    setPost((prev) => {
      let changed = false;
      const next = { ...prev };
      if (prev.wordCount !== wc) { next.wordCount = wc; changed = true; }
      if (prev.readTime !== rt) { next.readTime = rt; changed = true; }
      if (prev.excerpt.trim() === "" && prev.excerpt !== suggestedExcerpt) {
        next.excerpt = suggestedExcerpt; changed = true;
      }
      return changed ? (next as BlogPost) : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.content]);

  // Track unsaved changes (removed localStorage persistence; autosave handles local via IndexedDB)
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    if (skipDraftRef.current) {
      skipDraftRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [post, draftKey]);

  // When autosave finishes, reflect saved time and clear "unsaved" flag
  useEffect(() => {
    if (autosaveStatus === "saved" && autosaveSavedAt) {
      setLastSaved(autosaveSavedAt);
      setIsDirty(false);
    }
  }, [autosaveStatus, autosaveSavedAt]);

  // Warn before unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const savePost = useCallback(async (isAutoSave = false) => {
    // Prevent overlapping saves
    if (saveInFlight.current) return;
    if (!isAutoSave) setSaving(true);
    saveInFlight.current = true;

    try {
      const method = post.id ? "PUT" : "POST";
      const url = post.id ? `/api/admin/blogs/${post.id}` : "/api/admin/blogs";
      const normalizedSlug = slugify(post.slug || post.title);
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          slug: normalizedSlug,
          category: post.categories?.[0] || post.category || "",
          // send ISO strings to the server
          publishedAt: post.status === "published" ? new Date().toISOString() : undefined,
          scheduledFor: post.status === "scheduled" ? getScheduledDateTime()?.toISOString() : undefined,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        let message = `Save failed: ${response.status}`;
        try {
          const err = await response.json();
          if (err?.error) message = err.error;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const savedPost = await response.json();
      // prevent the next post state write from marking dirty
      skipDraftRef.current = true;
      setPost((prev) => ({ ...prev, id: savedPost.id, slug: normalizedSlug }));
      setLastSaved(new Date());
      setIsDirty(false);

      // Quiet autosave; keep toast for manual saves only
      if (!isAutoSave) {
        toast.success("Post saved successfully!");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save post:", error);
      // No autosave toast noise; manual saves show a toast
      if (!isAutoSave) toast.error((error as Error).message || "Failed to save post");
    } finally {
      saveInFlight.current = false;
      if (!isAutoSave) setSaving(false);
    }
  }, [post, getScheduledDateTime, toast]);

  // Keyboard shortcuts: Cmd/Ctrl+S to save, Cmd/Ctrl+P to preview
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "s") {
        e.preventDefault();
        void savePost();
      }
      if ((e.metaKey || e.ctrlKey) && k === "p") {
        e.preventDefault();
        setShowPreview(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [savePost]);

  // REMOVED: legacy autosave timers (debounce + heartbeat). Autosave now handled by useAutosave hook.

  // Load revisions for current post
  const loadRevisions = async () => {
    if (!post.id) return;
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}/revisions`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.revisions || []);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load revisions:", err);
    }
  };

  useEffect(() => {
    if (!post.id) return;
    loadRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const restoreRevision = async (id: string) => {
    if (!post.id) return;
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId: id }),
        credentials: "include",
      });
      if (res.ok) {
        const restored = await res.json();
        setPost(restored);
        toast.success("Revision restored");
        loadRevisions();
      } else {
        toast.error("Failed to restore revision");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to restore revision:", err);
      toast.error("Failed to restore revision");
    }
  };

  // WebSocket connect for cursor sync
  useEffect(() => {
    if (!post.id) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/admin/blogs/${post.id}/sync`);
    setWs(socket);
    return () => {
      try { socket.close(); } catch {}
    };
  }, [post.id]);

  // Simple heartbeat to keep connection alive
  useEffect(() => {
    if (!ws) return;
    const h = setInterval(() => {
      if (ws.readyState === 1) {
        try { ws.send(JSON.stringify({ type: "pong" })); } catch {}
      }
    }, 25000);
    return () => clearInterval(h);
  }, [ws]);

  const publishPost = async () => {
    if (!post.title?.trim() || !post.content?.trim()) {
      toast.error("Add a title and content before publishing");
      return;
    }
    setPost((prev) => ({ ...prev, status: "published" }));
    await savePost();
    router.push("/admin/dashboard?tab=blogs");
  };

  const schedulePost = async () => {
    const dt = getScheduledDateTime();
    if (!dt || dt <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    setPost((prev) => ({ ...prev, status: "scheduled", scheduledFor: dt }));
    await savePost();
    setShowScheduler(false);
  };

  const addTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;
    if (post.tags.includes(newTag)) {
      toast.warning("Tag already added!");
      return;
    }
    setPost((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const selectedCategories = categories.filter((cat) =>
    post.categories.includes(cat.slug)
  );

  function formatDateTime(dt: Date) {
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  const host = typeof window !== "undefined" ? window.location.host : "example.com";

  // Prepare a blog post for preview using the store shape
  const previewPost: StoreBlogPost = {
    ...post,
    publishedAt: (post.publishedAt ?? new Date()).toISOString(),
    createdAt: post.createdAt ?? new Date().toISOString(),
    updatedAt: post.updatedAt ?? new Date().toISOString(),
    views: post.views ?? 0,
    commentCount: post.commentCount ?? 0,
  };

  // NEW: derive a compact autosave status label
  const autosaveLabel = (() => {
    if (autosaveStatus === "saving") return "Saving…";
    if (autosaveStatus === "saved" && autosaveSavedAt) {
      const hhmm = autosaveSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `Saved at ${hhmm}`;
    }
    if (autosaveStatus === "offline") return "Offline, saving locally";
    if (autosaveStatus === "error") return "Sync failed";
    if (autosaveStatus === "conflict") return "Version changed on server";
    if (autosaveStatus === "unauthorized") return "Login required";
    return "";
  })();

  return (
    <>
      <motion.div
        className="max-w-7xl mx-auto space-y-6 pb-24 lg:pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{post.id ? "Edit Post" : "Create New Post"}</h1>
              <p className="text-gray-600">Write and publish your blog content</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {!online && (
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">Offline</span>
            )}
            {autosaveLabel && (
              <span className="text-sm text-gray-600">{autosaveLabel}</span>
            )}
            {isDirty ? (
              <span className="text-sm text-yellow-700">Unsaved changes</span>
            ) : (
              lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {formatDateTime(lastSaved)}
                </span>
              )
            )}
            <Button variant="outline" onClick={() => savePost()} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>

            {/* History Sidebar */}
            <Sheet onOpenChange={(open) => open && loadRevisions()}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle>Revision History</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {revisions.map((rev) => (
                    <div key={rev.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{new Date(rev.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{rev.author}</p>
                      </div>
                      <Button size="sm" onClick={() => restoreRevision(rev.id)}>Restore</Button>
                    </div>
                  ))}
                  {revisions.length === 0 && (
                    <p className="text-sm text-gray-500">No revisions</p>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Preview Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2"
                  aria-label="Preview post"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={publishPost}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2"
                  aria-label="Publish post"
                  disabled={!online}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Publish
                </Button>
              </TooltipTrigger>
              <TooltipContent>Publish</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={post.title}
                    onChange={(e) => setPost((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your blog post title..."
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <Input
                    value={post.slug}
                    onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                    onBlur={() => setPost((prev) => ({ ...prev, slug: slugify(prev.slug) }))}
                    placeholder="url-friendly-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <Textarea
                    value={post.excerpt}
                    onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of your post..."
                    rows={3}
                  />
                  <p className="text-xs mt-1 text-gray-500">{post.excerpt.length}/160 characters</p>
                </div>
              </CardContent>
            </Card>
            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle id={contentHeadingId} className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={post.content}
                  onChange={(content) => setPost((prev) => ({ ...prev, content }))}
                  placeholder="Start writing your blog post..."
                  socket={ws}
                  ariaLabelledBy={contentHeadingId}
                />
              </CardContent>
            </Card>
            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" aria-hidden="true" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Title</label>
                  <Input
                    value={post.seoTitle}
                    onChange={(e) => setPost((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="SEO optimized title..."
                  />
                  <p className={`text-xs mt-1 ${getLengthClass((post.seoTitle ?? "").length, titleMin, titleMax)}`}>
                    {(post.seoTitle ?? "").length}/{titleMax} characters
                  </p>
                  <p className={`text-xs ${getLengthClass((post.seoTitle ?? "").length, titleMin, titleMax)}`}>{getLengthMessage((post.seoTitle ?? "").length, titleMin, titleMax)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                  <Textarea
                    value={post.seoDescription}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        seoDescription: e.target.value.slice(0, descMax),
                      }))
                    }
                    placeholder="Brief description for search engines..."
                    rows={3}
                  />
                <p className={`text-xs mt-1 ${getLengthClass((post.seoDescription ?? "").length, descMin, descMax)}`}>
                    {(post.seoDescription ?? "").length}/{descMax} characters
                  </p>
                  <p className={`text-xs ${getLengthClass((post.seoDescription ?? "").length, descMin, descMax)}`}>{getLengthMessage((post.seoDescription ?? "").length, descMin, descMax)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Keywords</label>
                  <Input
                    value={post.seoKeywords}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        seoKeywords: e.target.value,
                      }))
                    }
                    placeholder="keyword1, keyword2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">OpenGraph Image URL</label>
                  <Input
                    value={post.openGraphImage}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        openGraphImage: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Schema Type</label>
                  <Input
                    value={post.schemaType}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        schemaType: e.target.value,
                      }))}
                    placeholder="Article"
                  />
                </div>
                {/* PATCHED: Google-style Search Preview */}
                <div>
                  <label className="block text-sm font-medium mb-2">Search Preview</label>
                  <div className="border rounded-lg p-4 bg-white space-y-1">
                    {(post.openGraphImage || post.featuredImage) && (
                      <Image
                        src={post.openGraphImage || post.featuredImage}
                        alt="Preview"
                        width={600}
                        height={128}
                        className="w-full h-32 object-cover rounded mb-2"
                        loading="lazy"
                      />
                    )}
                    <p className="text-xs text-green-700 truncate">{`${host}/${post.slug}`}</p>
                    <p className="text-blue-800 text-lg leading-snug">
                      {(post.seoTitle || post.title || "Untitled").substring(0, titleMax)}
                      {((post.seoTitle || post.title || "").length > titleMax) ? "…" : ""}
                    </p>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {(post.seoDescription || post.excerpt || "").substring(0, descMax)}
                      {((post.seoDescription || post.excerpt || "").length > descMax) ? "…" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </div>
                {/* Featured Post Switch */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="featured-switch" className="text-sm font-medium">
                      Featured Post
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </TooltipTrigger>
                      <TooltipContent>Toggle featured post</TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    id="featured-switch"
                    checked={post.featured}
                    onCheckedChange={(featured) =>
                      setPost((prev) => ({ ...prev, featured }))
                    }
                  />
                </div>
                {/* Schedule Popover */}
                <Popover open={showScheduler} onOpenChange={setShowScheduler}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center gap-2" aria-label="Schedule Post">
                      <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                      Schedule Post
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                    />
                    <div className="px-3 pb-3">
                      <label htmlFor="scheduled-time" className="block text-sm font-medium mt-2">
                        Time
                      </label>
                      <Input
                        id="scheduled-time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                    <div className="p-3 border-t">
                      <Button onClick={schedulePost} disabled={!scheduledDate || !scheduledTime} className="w-full">
                        Schedule
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
            {/* Category & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" aria-hidden="true" />
                  Categories & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multi-select categories as vertical checkboxes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Categories</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                    {categories.map((category) => (
                      <div key={category.slug} className="flex items-start gap-2">
                        <Checkbox
                          id={`cat-${category.slug}`}
                          checked={post.categories.includes(category.slug)}
                          onCheckedChange={(checked) => {
                            setPost((prev) => {
                              const categories = !!checked
                                ? [...prev.categories, category.slug]
                                : prev.categories.filter((c) => c !== category.slug);
                              return {
                                ...prev,
                                categories,
                                category: categories[0] || "",
                              };
                            });
                          }}
                          className="capitalize"
                        />
                        <label htmlFor={`cat-${category.slug}`} className="capitalize text-sm">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCategories.map((cat) => (
                        <Badge key={cat.slug} variant="secondary" className="flex items-center gap-1 capitalize">
                          {cat.name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              setPost((prev) => {
                                const categories = prev.categories.filter((c) => c !== cat.slug);
                                return {
                                  ...prev,
                                  categories,
                                  category: categories[0] || "",
                                };
                              })
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {/* Category descriptions removed in admin view */}
                </div>
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2 items-start">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} size="sm" className="self-start">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Featured Image Section (Media Library only) */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {post.featuredImage ? (
                  <div className="space-y-3">
                    <Image
                      src={post.featuredImage || "/placeholder.svg"}
                      alt="Featured"
                      width={600}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPost((prev) => ({ ...prev, featuredImage: "" }))}
                        className="w-full"
                      >
                        Remove Image
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowMediaPicker(true)}
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" aria-hidden="true" />
                    <p className="text-sm text-gray-600 mb-3">Choose a featured image</p>
                    <Button variant="outline" onClick={() => setShowMediaPicker(true)}>
                      Choose from Media Library
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Post Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                  Post Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Word Count</span>
                  <span className="text-sm font-medium">{post.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Read Time</span>
                  <span className="text-sm font-medium">{post.readTime}</span>
                </div>
                {/* Author Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <Select
                    value={post.author}
                    onValueChange={(val) =>
                      setPost((prev) => ({ ...prev, author: val }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((a) => (
                        <SelectItem key={a.id} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="text-sm font-medium">{post.views ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="text-sm font-medium">{post.commentCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shares</span>
                  <span className="text-sm font-medium">{post.shareCount ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Mobile action bar (safe-area) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => savePost()}
          disabled={saving}
          className="flex-1 flex items-center gap-2"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          className="flex-1 flex items-center gap-2"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Preview
        </Button>
        <Button
          onClick={publishPost}
          disabled={!online}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Publish
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl overflow-y-auto max-h-screen">
          <BlogPostRenderer post={previewPost} />
        </DialogContent>
      </Dialog>

      {/* Media Library Picker */}
      <MediaPickerDialog
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={(url) => {
          setPost((prev) => ({ ...prev, featuredImage: url }));
          setShowMediaPicker(false);
        }}
      />
    </>
  );
}
