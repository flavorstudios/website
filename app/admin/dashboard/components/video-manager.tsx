"use client";

import React, { useEffect, useMemo, useState, useDeferredValue } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryDropdown } from "@/components/ui/category-dropdown";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/AdminPageHeader";
import { VideoForm } from "@/components/ui/video-form";
import {
  Info,
  Eye,
  Pencil,
  Trash2,
  Upload,
  Archive,
  Copy,
  CopyPlus,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";
import type { Category } from "@/types/category";

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  category: string; // category slug
  tags: string[];
  status: "published" | "draft" | "unlisted";
  publishedAt: string; // ISO
  views: number;
  featured: boolean;
  episodeNumber?: number;
  season?: string;
}

const STORAGE_KEY = "video-manager-settings";

// Utilities ------------------------------------------------------------------
function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  // Fallback
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function VideoStatusBadge({ status }: { status: Video["status"] }) {
  const map: Record<Video["status"], { label: string; className: string }> = {
    published: { label: "Published", className: "bg-green-100 text-green-700" },
    draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
    unlisted: { label: "Unlisted", className: "bg-amber-100 text-amber-700" },
  };
  const { label, className } = map[status];
  return <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", className)}>{label}</span>;
}

// Bulk Actions Bar ------------------------------------------------------------
function VideoBulkActions({
  count,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  count: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-2 z-30 rounded-xl border bg-white/95 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm">
          <strong>{count}</strong> selected
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPublish}>
            <Upload className="mr-1 h-4 w-4" /> Publish
          </Button>
          <Button variant="outline" size="sm" onClick={onUnpublish}>
            <Archive className="mr-1 h-4 w-4" /> Unpublish
          </Button>
          <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// Desktop table ---------------------------------------------------------------
function VideoTable({
  videos,
  selected,
  toggleSelect,
  toggleSelectAll,
  onDelete,
  onTogglePublish,
  onDuplicate,
  categories,
  onCopyLink,
}: {
  videos: Video[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (checked: boolean) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  onDuplicate: (id: string) => void;
  categories: Category[];
  onCopyLink: (slug: string) => void;
}) {
  const allSelected = videos.length > 0 && videos.every((v) => selected.has(v.id));
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th scope="col" className="w-8 p-3">
              <input type="checkbox" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} aria-label="Select all" />
            </th>
            <th scope="col" className="p-3 text-left">Thumbnail</th>
            <th scope="col" className="p-3 text-left">Title</th>
            <th scope="col" className="hidden p-3 text-left md:table-cell">Category</th>
            <th scope="col" className="p-3 text-left">Status</th>
            <th scope="col" className="hidden p-3 text-left sm:table-cell">Date</th>
            <th scope="col" className="hidden p-3 text-right sm:table-cell">Views</th>
            <th scope="col" className="hidden p-3 text-left md:table-cell">Duration</th>
            <th scope="col" className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => {
            const catObj = categories.find((cat) => cat.slug === video.category);
            const isPublished = video.status === "published";
            return (
              <tr key={video.id} className="border-t">
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(video.id)} onChange={() => toggleSelect(video.id)} aria-label={`Select ${video.title}`} />
                </td>
                <td className="p-3">
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail}
                      alt={`Thumbnail for ${video.title}`}
                      width={96}
                      height={60}
                      className="h-16 w-28 rounded object-cover"
                    />
                  )}
                </td>
                <td className="p-3">
                  <a href={`/admin/video/edit?id=${video.id}`} className="font-medium text-blue-600 hover:underline">
                    {video.title}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {video.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                    {video.featured && <Badge className="text-[10px]">Featured</Badge>}
                  </div>
                </td>
                <td className="hidden p-3 md:table-cell">{catObj?.name || video.category}</td>
                <td className="p-3">
                  <VideoStatusBadge status={video.status} />
                </td>
                <td className="hidden p-3 sm:table-cell">{formatDate(video.publishedAt)}</td>
                <td className="hidden p-3 text-right sm:table-cell">{(video.views ?? 0).toLocaleString()}</td>
                <td className="hidden p-3 md:table-cell">{video.duration || "—"}</td>
                <td className="p-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Open actions menu">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4}>
                      <DropdownMenuItem asChild>
                        <a href={`/admin/video/edit?id=${video.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/watch/${video.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" />
                          <span>View</span>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          onCopyLink(video.slug);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          onDuplicate(video.id);
                        }}
                      >
                        <CopyPlus className="h-4 w-4 mr-2" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          onTogglePublish(video.id, !isPublished);
                        }}
                      >
                        {isPublished ? (
                          <Archive className="h-4 w-4 mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        <span>{isPublished ? "Unpublish" : "Publish"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          onDelete(video.id);
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Video card reusable component ----------------------------------------------
function VideoCard({
  video,
  selected,
  toggleSelect,
  onDelete,
  onTogglePublish,
  categories,
  onCopyLink,
  onDuplicate,
  className,
}: {
  video: Video;
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  categories: Category[];
  onCopyLink: (slug: string) => void;
  onDuplicate: (id: string) => void;
  className?: string;
}) {
  const catObj = categories.find((cat) => cat.slug === video.category);
  const isPublished = video.status === "published";
  return (
    <div className={cn("rounded-lg border p-3 shadow-sm", className)}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected.has(video.id)}
          onChange={() => toggleSelect(video.id)}
          aria-label={`Select ${video.title}`}
          className="mt-1"
        />
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt={`Thumbnail for ${video.title}`}
            width={128}
            height={72}
            className="h-20 w-32 rounded object-cover"
          />
        )}
        <div className="flex-1">
          <a
            href={`/admin/video/edit?id=${video.id}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {video.title}
          </a>
          <div className="text-xs text-gray-500">{catObj?.name || video.category}</div>
          <div className="mt-1 flex items-center gap-2">
            <VideoStatusBadge status={video.status} />
            <span className="text-xs text-gray-400">{formatDate(video.publishedAt)}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{(video.views ?? 0).toLocaleString()} views</span>
            {video.duration && <span>• {video.duration}</span>}
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Open actions for ${video.title}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem asChild>
              <a href={`/admin/video/edit?id=${video.id}`}>
                <Pencil className="h-4 w-4 mr-2" />
                <span>Edit</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`/watch/${video.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span>View</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onCopyLink(video.slug);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              <span>Copy Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onDuplicate(video.id);
              }}
            >
              <CopyPlus className="h-4 w-4 mr-2" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onTogglePublish(video.id, !isPublished);
              }}
            >
              {isPublished ? (
                <Archive className="h-4 w-4 mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              <span>{isPublished ? "Unpublish" : "Publish"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onDelete(video.id);
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Mobile card list ------------------------------------------------------------
function VideoCardList({
  videos,
  selected,
  toggleSelect,
  onDelete,
  onTogglePublish,
  categories,
  onCopyLink,
  onDuplicate,
}: {
  videos: Video[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  categories: Category[];
  onCopyLink: (slug: string) => void;
  onDuplicate: (id: string) => void;
}) {
  return (
    <div className="space-y-4 md:hidden">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          selected={selected}
          toggleSelect={toggleSelect}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
          categories={categories}
          onCopyLink={onCopyLink}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}

// Desktop grid view -----------------------------------------------------------
function VideoGrid({
  videos,
  selected,
  toggleSelect,
  onDelete,
  onTogglePublish,
  categories,
  onCopyLink,
  onDuplicate,
}: {
  videos: Video[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  categories: Category[];
  onCopyLink: (slug: string) => void;
  onDuplicate: (id: string) => void;
}) {
  return (
    <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          selected={selected}
          toggleSelect={toggleSelect}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
          categories={categories}
          onCopyLink={onCopyLink}
          onDuplicate={onDuplicate}
          className="h-full"
        />
      ))}
    </div>
  );
}

// Pagination (simple local) ---------------------------------------------------
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Prev
      </Button>
      {pages.map((p) => (
        <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" onClick={() => onPageChange(p)}>
          {p}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </Button>
    </div>
  );
}

// Main component --------------------------------------------------------------
export default function VideoManager() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | Video["status"]>("all");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "regular">("all");
  const [filterTag, setFilterTag] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterViewsMin, setFilterViewsMin] = useState("");
  const [filterViewsMax, setFilterViewsMax] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "status" | "views">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [currentPage, setCurrentPage] = useState(1);
  const [videosPerPage, setVideosPerPage] = useState(10);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);
  const [bulkAction, setBulkAction] = useState<null | "publish" | "unpublish">(null);

  const deferredSearch = useDeferredValue(searchTerm);

  // Persist settings ---------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.searchTerm) setSearchTerm(saved.searchTerm);
      if (saved.filterCategory) setFilterCategory(saved.filterCategory);
      if (saved.filterStatus) setFilterStatus(saved.filterStatus);
      if (saved.filterFeatured) setFilterFeatured(saved.filterFeatured);
      if (saved.filterTag) setFilterTag(saved.filterTag);
      if (saved.filterDateFrom) setFilterDateFrom(saved.filterDateFrom);
      if (saved.filterDateTo) setFilterDateTo(saved.filterDateTo);
      if (saved.filterViewsMin) setFilterViewsMin(saved.filterViewsMin);
      if (saved.filterViewsMax) setFilterViewsMax(saved.filterViewsMax);
      if (saved.sortBy) setSortBy(saved.sortBy);
      if (saved.sortOrder) setSortOrder(saved.sortOrder);
      if (saved.videosPerPage) setVideosPerPage(saved.videosPerPage);
      if (saved.viewMode) setViewMode(saved.viewMode);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = {
      searchTerm,
      filterCategory,
      filterStatus,
      filterFeatured,
      filterTag,
      filterDateFrom,
      filterDateTo,
      filterViewsMin,
      filterViewsMax,
      sortBy,
      sortOrder,
      videosPerPage,
      viewMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    searchTerm,
    filterCategory,
    filterStatus,
    filterFeatured,
    filterTag,
    filterDateFrom,
    filterDateTo,
    filterViewsMin,
    filterViewsMax,
    sortBy,
    sortOrder,
    videosPerPage,
    viewMode,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterStatus("all");
    setFilterFeatured("all");
    setFilterTag("");
    setSortBy("date");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterViewsMin("");
    setFilterViewsMax("");
    setSortOrder("desc");
    setSelected(new Set());
    setVideosPerPage(10);
    setCurrentPage(1);
    setViewMode("table");
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  // Data loading --------------------------------------------------------------
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [videosRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/videos", { credentials: "include" }),
        fetch("/api/categories?type=video", { credentials: "include" }),
      ]);
      if (!videosRes.ok || !categoriesRes.ok) throw new Error("Failed to load");
      const [videosJson, categoriesJson] = await Promise.all([
        videosRes.json(),
        categoriesRes.json(),
      ]);
      setVideos(videosJson.videos ?? []);
      setCategories(categoriesJson.categories ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function createVideo(data: Partial<Video>) {
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Video created.");
        await loadData();
        setShowCreateForm(false);
      }
    } catch {
      toast("Failed to create video.");
    }
  }

  async function updateVideo(id: string, data: Partial<Video>) {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Video updated.");
        await loadData();
        setEditingVideo(null);
      }
    } catch {
      toast("Failed to update video.");
    }
  }

  async function deleteVideo(id: string) {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        toast("Video deleted.");
        await loadData();
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch {
      toast("Failed to delete video.");
    }
  }

  async function togglePublish(id: string, publish: boolean, opts?: { skipReload?: boolean }) {
    try {
      const res = await fetch(`/api/admin/videos/${id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: publish ? "published" : "draft" }),
      });
      if (res.ok) {
        toast(publish ? "Video published." : "Video unpublished.");
        if (!opts?.skipReload) await loadData();
      }
    } catch {
      toast("Failed to update video status.");
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(filteredVideos.map((v) => v.id)));
    else setSelected(new Set());
  };

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/watch/${slug}`;
    const ok = await copyToClipboard(url);
    toast(ok ? "Link copied to clipboard" : "Unable to copy link");
  };

  const duplicateVideo = async (id: string) => {
    const original = videos.find((v) => v.id === id);
    if (!original) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, views: _views, ...rest } = original;
      const data = {
        ...rest,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        status: "draft" as const,
        publishedAt: new Date().toISOString(),
      };
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Video duplicated.");
        await loadData();
      } else {
        toast("Failed to duplicate video.");
      }
    } catch {
      toast("Failed to duplicate video.");
    }
  };

  const exportCSV = () => {
    const headers = ["Title", "Slug", "Category", "Status", "Published", "Views", "Duration"];
    const rows = sortedVideos.map((v) => [
      v.title,
      v.slug,
      v.category,
      v.status,
      v.publishedAt,
      String(v.views ?? 0),
      v.duration || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "videos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtering & sorting -------------------------------------------------------
  const filteredVideos = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const tag = filterTag.trim().toLowerCase();
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;
    const minViews = filterViewsMin ? parseInt(filterViewsMin) : null;
    const maxViews = filterViewsMax ? parseInt(filterViewsMax) : null;
    return videos.filter((video) => {
      const matchesSearch =
        !term ||
        video.title.toLowerCase().includes(term) ||
        video.slug.toLowerCase().includes(term) ||
        video.description.toLowerCase().includes(term) ||
        video.tags.some((t) => t.toLowerCase().includes(term));
      const matchesCategory = !filterCategory || video.category === filterCategory;
      const matchesStatus = filterStatus === "all" || video.status === filterStatus;
      const matchesFeatured =
        filterFeatured === "all" ||
        (filterFeatured === "featured" && video.featured) ||
        (filterFeatured === "regular" && !video.featured);
      const matchesTag =
        !tag || video.tags.some((t) => t.toLowerCase().includes(tag));
      const published = new Date(video.publishedAt);
      const matchesFrom = !fromDate || published >= fromDate;
      const matchesTo = !toDate || published <= toDate;
      const views = video.views ?? 0;
      const matchesViews = (!minViews || views >= minViews) && (!maxViews || views <= maxViews);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured &&
        matchesTag &&
        matchesFrom &&
        matchesTo &&
        matchesViews
      );
    });
  }, [
    videos,
    deferredSearch,
    filterCategory,
    filterStatus,
    filterFeatured,
    filterTag,
    filterDateFrom,
    filterDateTo,
    filterViewsMin,
    filterViewsMax,
  ]);

  const sortedVideos = useMemo(() => {
    const arr = [...filteredVideos];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") cmp = a.title.localeCompare(b.title);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      else if (sortBy === "views") cmp = (a.views || 0) - (b.views || 0);
      else cmp = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredVideos, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage) || 1;
  const paginatedVideos = useMemo(
    () => sortedVideos.slice((currentPage - 1) * videosPerPage, currentPage * videosPerPage),
    [sortedVideos, currentPage, videosPerPage]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterCategory,
    filterStatus,
    filterFeatured,
    sortBy,
    sortOrder,
    filterTag,
    filterDateFrom,
    filterDateTo,
    videosPerPage,
    filterViewsMin,
    filterViewsMax,
  ]);

  // Bulk actions --------------------------------------------------------------
  const handleBulk = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete") {
      setDeleteTargets(ids);
      return;
    }
    setBulkAction(action);
  };

  const confirmBulkToggle = async () => {
    if (!bulkAction) return;
    const ids = Array.from(selected);
    const publish = bulkAction === "publish";
    try {
      await Promise.all(ids.map((id) => togglePublish(id, publish, { skipReload: true })));
    } finally {
      setSelected(new Set());
      await loadData();
      setBulkAction(null);
    }
  };

  const totalVideos = sortedVideos.length;
  const startIndex = (currentPage - 1) * videosPerPage + 1;
  const endIndex = Math.min(startIndex + paginatedVideos.length - 1, totalVideos);

  const stats = useMemo(() => {
    const published = videos.filter((v) => v.status === "published").length;
    const draft = videos.filter((v) => v.status === "draft").length;
    const unlisted = videos.filter((v) => v.status === "unlisted").length;
    return { total: videos.length, published, draft, unlisted };
  }, [videos]);

  return (
    <div className={cn("space-y-6", selected.size > 0 && "pb-20 sm:pb-6")}> 
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AdminPageHeader title="Video Manager" subtitle="Manage your YouTube content and episodes" />
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
            aria-label="Table view"
            title="Table view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={exportCSV}
            aria-label="Export videos to CSV"
            title="Export videos to CSV"
          >
            Export CSV
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            aria-label="Add new video"
            title="Add new video"
          >
            Add New Video
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-xl font-semibold">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-xl font-semibold">{stats.published}</div>
          <div className="text-xs text-gray-500">Published</div>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-xl font-semibold">{stats.draft}</div>
          <div className="text-xs text-gray-500">Drafts</div>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-xl font-semibold">{stats.unlisted}</div>
          <div className="text-xs text-gray-500">Unlisted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          type="search"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-60"
          aria-label="Search videos"
        />

        <CategoryDropdown
          categories={
            Array.isArray(categories)
              ? categories.map((cat) => ({
                  name: cat.name,
                  slug: cat.slug,
                  // Ensure a numeric count is always provided for CategoryData
                  count: cat.postCount ?? 0,
                  tooltip: cat.tooltip ?? undefined,
                  order: cat.order ?? 0,
                  isActive: true,
                }))
              : []
          }
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          placeholder="All categories"
          includeAll
          className="w-full sm:w-48"
        />

        <Input
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="w-full sm:w-40"
          aria-label="Filter by tag"
        />

        <Input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="w-full sm:w-44"
          aria-label="Published after"
        />

        <Input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="w-full sm:w-44"
          aria-label="Published before"
        />

        <Input
          type="number"
          placeholder="Min views"
          value={filterViewsMin}
          onChange={(e) => setFilterViewsMin(e.target.value)}
          className="w-full sm:w-32"
          aria-label="Minimum views"
        />

        <Input
          type="number"
          placeholder="Max views"
          value={filterViewsMax}
          onChange={(e) => setFilterViewsMax(e.target.value)}
          className="w-full sm:w-32"
          aria-label="Maximum views"
        />

        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as any)}>
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

        <Select value={filterFeatured} onValueChange={(val) => setFilterFeatured(val as any)}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Featured">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
            <SelectItem value="regular">Non-Featured</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Sort By">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="views">Views</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as any)}>
          <SelectTrigger className="w-full sm:w-32" aria-label="Sort order">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(videosPerPage)} onValueChange={(val) => setVideosPerPage(Number(val))}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Items per page">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="w-full sm:w-auto" onClick={resetFilters} aria-label="Clear filters">
          Clear Filters
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        Showing {startIndex}-{endIndex} of {totalVideos} video{totalVideos === 1 ? "" : "s"}
      </div>

      {/* Bulk actions (sticky) */}
      <VideoBulkActions count={selected.size} onPublish={() => handleBulk("publish")} onUnpublish={() => handleBulk("unpublish")} onDelete={() => handleBulk("delete")} />

      {/* Main content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Info className="mb-4 h-12 w-12 text-red-500" />
          <p className="text-lg text-gray-800">{error}</p>
          <Button onClick={loadData} className="mt-6" aria-label="Retry loading">
            Retry
          </Button>
        </div>
      ) : paginatedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2" aria-hidden>
            <rect width="56" height="56" rx="12" fill="#F3F4F6" />
            <path d="M19 29V35C19 35.5523 19.4477 36 20 36H36C36.5523 36 37 35.5523 37 35V29" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
            <rect x="15" y="19" width="26" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2" />
            <circle cx="28" cy="24" r="1.5" fill="#A1A1AA" />
          </svg>
          <span className="text-lg font-medium">No videos found</span>
          <span className="mt-2 text-sm">Try changing your filters or add a new video.</span>
        </div>
      ) : (
        <>
          {viewMode === "table" ? (
            <div className="hidden md:block">
              <VideoTable
                videos={paginatedVideos}
                selected={selected}
                toggleSelect={toggleSelect}
                toggleSelectAll={toggleSelectAll}
                onDelete={deleteVideo}
                onTogglePublish={togglePublish}
                categories={categories}
                onCopyLink={copyLink}
                onDuplicate={duplicateVideo}
              />
            </div>
          ) : (
            <VideoGrid
              videos={paginatedVideos}
              selected={selected}
              toggleSelect={toggleSelect}
              onDelete={deleteVideo}
              onTogglePublish={togglePublish}
              categories={categories}
              onCopyLink={copyLink}
              onDuplicate={duplicateVideo}
            />
          )}
          {/* Mobile list */}
          <VideoCardList
            videos={paginatedVideos}
            selected={selected}
            toggleSelect={toggleSelect}
            onDelete={deleteVideo}
            onTogglePublish={togglePublish}
            categories={categories}
            onCopyLink={copyLink}
            onDuplicate={duplicateVideo}
          />
        </>
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

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
        />
      )}

      {/* Delete Modal (single or bulk) */}
      {deleteTargets && (
        <AlertDialog open onOpenChange={(open) => !open && setDeleteTargets(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteTargets.length > 1 ? "Videos" : "Video"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The selected {deleteTargets.length > 1 ? "videos" : "video"} will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  try {
                    await Promise.all(deleteTargets.map((id) => deleteVideo(id)));
                  } finally {
                    setDeleteTargets(null);
                    setSelected(new Set());
                    await loadData();
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Bulk publish/unpublish confirm */}
      {bulkAction && (
        <AlertDialog open onOpenChange={(open) => !open && setBulkAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {bulkAction === "publish" ? "Publish selected videos?" : "Unpublish selected videos?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will update the status of {selected.size} video{selected.size > 1 ? "s" : ""}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkToggle}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
