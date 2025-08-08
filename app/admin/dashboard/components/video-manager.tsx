"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryDropdown } from "@/components/ui/category-dropdown";
import { toast } from "@/components/ui/toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Info, Eye, Pencil, Trash2, Upload, Archive, Tag, ChevronDown, Play } from "lucide-react";
import { VideoForm } from "@/components/ui/video-form";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/AdminPageHeader";
import MediaPickerDialog from "./media/MediaPickerDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Category } from "@/types/category";

// ✅ Shared video admin components (single source of truth)
import {
  VideoTable,
  VideoBulkActions,
  VideoStatusBadge,
  VideoRowActions,
  type AdminVideo,
} from "@/components/admin/video";

// ✅ Shared Pagination (remove local implementation)
import { Pagination } from "@/components/admin/Pagination";

// 🔹 Tag multi-select (local, non-breaking)
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Local UI shape extends AdminVideo with optional presentation-only fields
type Video = AdminVideo & Partial<{
  thumbnail: string;
  views: number;
  duration: string;
}> & {
  // You already use this in filters; keep as-is
  category: string;
};

/* ----------------------------------------
   Skeleton table while loading
-----------------------------------------*/
function VideoTableSkeleton() {
  return (
    <div className="overflow-x-auto border rounded-lg" aria-busy="true" aria-live="polite">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th scope="col" className="p-3 w-8"></th>
            <th scope="col" className="p-3 text-left">Thumbnail</th>
            <th scope="col" className="p-3 text-left">Title</th>
            <th scope="col" className="p-3 text-left hidden md:table-cell">Category</th>
            <th scope="col" className="p-3 text-left">Status</th>
            <th scope="col" className="p-3 text-left hidden sm:table-cell">Date</th>
            <th scope="col" className="p-3 text-right hidden sm:table-cell">Views</th>
            <th scope="col" className="p-3 text-left hidden md:table-cell">Duration</th>
            <th scope="col" className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="p-3">
                <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3">
                <div className="h-10 w-16 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3">
                <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3 hidden md:table-cell">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3">
                <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3 hidden sm:table-cell">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3 hidden sm:table-cell text-right">
                <div className="h-4 w-12 ml-auto rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3 hidden md:table-cell">
                <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="p-3 text-right">
                <div className="h-4 w-16 ml-auto rounded bg-gray-200 animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------
   TagFilter – dropdown multi-select (non-invasive)
-----------------------------------------*/
function TagFilter({
  tags,
  selectedTags,
  onChange,
}: {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}) {
  const label =
    selectedTags.length > 0
      ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
      : "All Tags";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between sm:w-48"
          aria-label="Filter by tags"
        >
          <span className="flex items-center gap-2 truncate">
            <Tag className="h-4 w-4" />
            {label}
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto" align="start">
        {tags.length === 0 ? (
          <div className="px-2 py-1 text-sm text-muted-foreground">No tags found</div>
        ) : (
          tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={selectedTags.includes(tag)}
              onCheckedChange={(checked) =>
                onChange(
                  checked ? [...selectedTags, tag] : selectedTags.filter((t) => t !== tag)
                )
              }
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ----------------------------------------
   Mobile List (cards) – shown on md- and below
-----------------------------------------*/
function MobileVideoList({
  videos,
  selected,
  toggleSelect,
  toggleSelectAll,
  categories,
  onTogglePublish,
  onDelete,
  onPreview,
}: {
  videos: Video[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (checked: boolean) => void;
  categories: Category[]; // kept to match your current props, even if not used here
  onTogglePublish: (id: string, publish: boolean) => void;
  onDelete: (id: string) => void;
  onPreview: (video: Video) => void;
}) {
  const pageAllSelected = videos.length > 0 && videos.every((v) => selected.has(v.id));
  return (
    <div className="md:hidden space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={pageAllSelected}
          onCheckedChange={(checked) => toggleSelectAll(!!checked)}
          aria-label="Select all on this page"
        />
        <span className="text-sm text-muted-foreground">Select all</span>
      </div>

      {videos.map((video) => {
        const isPublished = video.status === "published";
        return (
          <div key={video.id} className="border rounded-lg p-3 flex gap-3 bg-white shadow-sm">
            <Checkbox
              className="mt-1"
              checked={selected.has(video.id)}
              onCheckedChange={() => toggleSelect(video.id)}
              aria-label={`Select ${video.title}`}
            />

            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt={`${video.title} thumbnail`}
                width={120}
                height={68}
                className="h-20 w-32 object-cover rounded"
              />
            ) : (
              <div className="h-20 w-32 rounded bg-gray-100 grid place-items-center text-xs text-gray-400">
                No image
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/admin/video/edit?id=${video.id}`}
                    className="block font-medium text-blue-600 hover:underline truncate"
                    title={video.title}
                  >
                    {video.title}
                  </Link>
                  <div className="text-xs text-gray-500">{video.category}</div>

                  {/* ✅ Tag badges under title (mobile) */}
                  {Array.isArray(video.tags) && video.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {video.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions: add a quick Preview button + shared actions */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Preview video"
                        title="Preview"
                        onClick={() => onPreview(video)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview</TooltipContent>
                  </Tooltip>

                  <VideoRowActions
                    video={video}
                    onTogglePublish={onTogglePublish}
                    onDelete={onDelete}
                  />
                </div>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <VideoStatusBadge status={video.status} />
                <span>
                  {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "—"}
                </span>
                <span>{video.views?.toLocaleString() ?? 0} views</span>
                <span>{video.duration}</span>
                {isPublished ? (
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Archive className="h-3.5 w-3.5" aria-hidden />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VideoManager({
  initialVideos = [],
  initialCategories = [],
}: {
  initialVideos?: Video[];
  initialCategories?: Category[];
}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(
    (initialVideos?.length ?? 0) === 0 || (initialCategories?.length ?? 0) === 0
  );
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all"); // ✅ default to "all"
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [filterStatus, setFilterStatus] = useState<"all" | Video["status"]>("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const VIDEOS_PER_PAGE = 10;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // 🔹 Temp setter to update the thumbnail field inside VideoForm
  const [thumbnailSetter, setThumbnailSetter] = useState<((url: string) => void) | null>(null);

  // 🔹 Tags state (new)
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 🔹 Preview modal state
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  // Build tags query string (memoized)
  const tagsQuery = useMemo(
    () => (filterTags.length > 0 ? `?tags=${encodeURIComponent(filterTags.join(","))}` : ""),
    [filterTags]
  );

  // Guard to avoid double-fetch on mount when tagsQuery effect also runs
  const skipNextTagsEffect = useRef<boolean>(false);

  // ✅ Unified query params for /api/admin/videos (Codex requirement)
  const queryParams = useMemo(() => {
    const p = new URLSearchParams();

    const trimmed = searchTerm.trim();
    if (trimmed) p.set("search", trimmed);

    if (filterCategory && filterCategory !== "all") p.set("category", filterCategory);
    if (filterStatus && filterStatus !== "all") p.set("status", filterStatus);
    if (sortBy) p.set("sortBy", sortBy);

    p.set("page", String(currentPage)); // always include page

    if (filterTags.length > 0) p.set("tags", filterTags.join(","));

    return p;
  }, [searchTerm, filterCategory, filterStatus, sortBy, currentPage, filterTags]);

  // --- Abort controller for cancellable fetches
  const fetchAbortRef = useRef<AbortController | null>(null);

  // Mount: if initial data provided, hydrate and derive tags; else fetch
  useEffect(() => {
    const hasInitial = (initialVideos?.length ?? 0) > 0 || (initialCategories?.length ?? 0) > 0;

    if (hasInitial) {
      // hydrate from props and finish loading
      setVideos(initialVideos);
      setCategories(initialCategories);

      const unique = Array.from(
        new Set(
          initialVideos.flatMap((v: any) =>
            Array.isArray(v.tags) ? v.tags.filter(Boolean) : []
          )
        )
      ).sort((a, b) => a.localeCompare(b));
      setAllTags(unique);

      setSelected(new Set());
      setLoading(false);
      // First tagsQuery effect should not immediately fetch
      skipNextTagsEffect.current = true;
    } else {
      // No initial data — fetch once on mount
      void loadData();
      // tags effect can run normally afterwards
      skipNextTagsEffect.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload on tag filter change (but skip the very first effect if we just hydrated)
  useEffect(() => {
    if (skipNextTagsEffect.current) {
      skipNextTagsEffect.current = false;
      return;
    }
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsQuery]);

  // ✅ Debounced refetch when any filter / page changes (Codex requirement)
  useEffect(() => {
    // Debounce
    const t = setTimeout(async () => {
      // cancel previous inflight
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      await loadData(controller.signal);
    }, 200);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  // Centralized data loader that honors current queryParams
  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const videosUrl = `/api/admin/videos?${queryParams.toString()}`;

      const [videosRes, categoriesRes] = await Promise.all([
        fetch(videosUrl, { credentials: "include", signal }),
        fetch("/api/admin/categories?type=video", { credentials: "include", signal }),
      ]);

      if (!videosRes.ok || !categoriesRes.ok) throw new Error("Failed to load data");

      const videosData = (await videosRes.json()).videos || [];
      const videoCategories = (await categoriesRes.json()).categories || [];

      setVideos(videosData);
      setCategories(videoCategories);

      // derive tag list from current result set
      const unique = Array.from(
        new Set(
          videosData.flatMap((v: any) =>
            Array.isArray(v.tags) ? v.tags.filter(Boolean) : []
          )
        )
      ).sort((a, b) => a.localeCompare(b));
      setAllTags(unique);

      // clear selection when new data loads
      setSelected(new Set());
    } catch (e: any) {
      if (e?.name === "AbortError") return; // ignore cancellations
      setError("Failed to load videos or categories.");
      toast("Failed to load videos or categories");
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async (videoData: Partial<Video>) => {
    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoData),
        credentials: "include",
      });
      if (response.ok) {
        toast("Video created!");
        await loadData();
        setShowCreateForm(false);
      }
    } catch {
      toast("Failed to create video.");
    }
  };

  const updateVideo = async (id: string, videoData: Partial<Video>) => {
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoData),
        credentials: "include",
      });
      if (response.ok) {
        toast("Video updated.");
        await loadData();
        setEditingVideo(null);
      }
    } catch {
      toast("Failed to update video.");
    }
  };

  const deleteVideo = (id: string) => {
    setDeleteTargets([id]);
  };

  const confirmDelete = async () => {
    if (!deleteTargets) return;
    for (const id of deleteTargets) {
      try {
        const response = await fetch(`/api/admin/videos/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.ok) {
          toast("Video deleted.");
          setSelected((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
          });
        } else {
          const data = await response.json();
          toast(data.error || "Failed to delete video.");
        }
      } catch {
        toast("Failed to delete video.");
      }
    }
    setDeleteTargets(null);
    setSelected(new Set());
    await loadData();
  };

  const togglePublish = async (id: string, publish: boolean) => {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: publish ? "published" : "draft" }),
      });
      if (res.ok) {
        toast(publish ? "Video published." : "Video unpublished.");
        await loadData();
      }
    } catch {
      toast("Failed to update video status.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || video.category === filterCategory; // ✅ skip when "all"
    const matchesStatus = filterStatus === "all" || video.status === filterStatus;
    // ✅ client-side tags check (defensive, server already filtered)
    const matchesTags =
      filterTags.length === 0 || filterTags.every((t) => Array.isArray(video.tags) && video.tags.includes(t));

    return matchesSearch && matchesCategory && matchesStatus && matchesTags;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(filteredVideos.map((v) => v.id)));
    else setSelected(new Set());
  };

  const handleBulk = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete") {
      setDeleteTargets(ids);
      return;
    }
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await togglePublish(id, action === "publish");
    }
    setSelected(new Set());
    await loadData();
  };

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate; // newest first
  });

  // ✅ Use totalCount for shared Pagination (client-side)
  const totalVideos = sortedVideos.length;

  const paginatedVideos = sortedVideos.slice(
    (currentPage - 1) * VIDEOS_PER_PAGE,
    currentPage * VIDEOS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
    // ✅ also clear selection when filters/search/sort change
    setSelected(new Set());
  }, [searchTerm, filterCategory, filterStatus, sortBy, filterTags]);

  return (
    <div className={cn("space-y-6", selected.size > 0 && "pb-20 sm:pb-6")}>
      {/* 🟣 Admin Dashboard Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <AdminPageHeader
          title="Video Manager"
          subtitle="Manage your YouTube content and episodes"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            aria-label="Add new video"
            title="Add new video"
          >
            Add New Video
          </Button>
          {/* Media Library button removed */}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-60"
          aria-label="Search by title"
        />
        <CategoryDropdown
          categories={[
            {
              name: "All Categories",
              slug: "all",
              count: videos.length,
              order: -1,
              isActive: true,
            },
            ...categories.map((cat) => ({
              name: cat.name,
              slug: cat.slug,
              count: cat.postCount,
              tooltip: cat.tooltip ?? undefined,
              order: cat.order ?? 0,
              isActive: true,
            })),
          ]}
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          type="video"
          className="w-full sm:w-48"
        />

        {/* ✅ NEW: Tags multi-select */}
        <TagFilter tags={allTags} selectedTags={filterTags} onChange={setFilterTags} />

        <Select
          value={filterStatus}
          onValueChange={(val) =>
            setFilterStatus(val as "all" | "draft" | "published" | "unlisted")
          }
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unlisted">Unlisted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Sort By">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions (sticky) */}
      <VideoBulkActions
        sticky
        count={selected.size}
        onPublish={() => handleBulk("publish")}
        onUnpublish={() => handleBulk("unpublish")}
        onDelete={() => handleBulk("delete")}
      />

      {/* Content */}
      {loading ? (
        <VideoTableSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Info className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg text-gray-800">{error}</p>
          <Button onClick={loadData} className="mt-6" aria-label="Retry loading">
            Retry
          </Button>
        </div>
      ) : paginatedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2"
            aria-hidden
          >
            <rect width="56" height="56" rx="12" fill="#F3F4F6" />
            <path d="M19 29V35C19 35.5523 19.4477 36 20 36H36C36.5523 36 37 35.5523 37 35V29" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
            <rect x="15" y="19" width="26" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2" />
            <circle cx="28" cy="24" r="1.5" fill="#A1A1AA" />
          </svg>
          <span className="text-lg font-medium">No videos found</span>
          <span className="text-sm mt-2">Try changing your filters or add a new video.</span>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <MobileVideoList
            videos={paginatedVideos}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            categories={categories}
            onTogglePublish={togglePublish}
            onDelete={deleteVideo}
            onPreview={(v) => setPreviewVideo(v)}
          />

          {/* Desktop table (shared) */}
          <VideoTable
            videos={paginatedVideos}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onDelete={deleteVideo}
            onTogglePublish={togglePublish}
            categories={categories}
          />
        </>
      )}

      {/* Pagination (shared) */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalVideos}
        pageSize={VIDEOS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingVideo) && (
        <VideoForm
          video={editingVideo || undefined}
          onSave={editingVideo ? (data) => updateVideo(editingVideo.id, data) : createVideo}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingVideo(null);
          }}
          categories={categories}
          // 🔹 Provide a thumbnail setter and open the media picker
          onChooseThumbnail={(setter) => {
            setThumbnailSetter(() => setter);
            setShowMediaPicker(true);
          }}
        />
      )}

      {/* Delete Modal for single and bulk */}
      {deleteTargets && (
        <AlertDialog open onOpenChange={(open) => !open && setDeleteTargets(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteTargets.length > 1 ? "Videos" : "Video"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <p>
              Are you sure you want to delete {deleteTargets.length > 1 ? "these" : "this"} video
              {deleteTargets.length > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <Dialog open onOpenChange={(open) => !open && setPreviewVideo(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewVideo.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${previewVideo.youtubeId}`}
                title={`${previewVideo.title} – YouTube preview`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Media Picker Dialog is still available for modal use if needed */}
      <MediaPickerDialog
        open={showMediaPicker}
        onOpenChange={(open: boolean) => {
          setShowMediaPicker(open);
          if (!open) setThumbnailSetter(null);
        }}
        // 🔹 When a media is chosen, update the form's thumbnail and close dialog
        onSelect={(url: string) => {
          if (thumbnailSetter) {
            thumbnailSetter(url);
          }
          setShowMediaPicker(false);
          setThumbnailSetter(null);
        }}
      />
    </div>
  );
}
