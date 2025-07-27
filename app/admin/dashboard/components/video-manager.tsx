"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image"; // Lint: For optimized image rendering in Next.js
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryDropdown } from "@/components/ui/category-dropdown";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info, Eye, Pencil, Trash2, Upload, Archive } from "lucide-react";
import { VideoForm } from "@/components/ui/video-form";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  type: "BLOG" | "VIDEO";
  tooltip?: string;
  color?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  postCount: number;
}

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  category: string;
  tags: string[];
  status: "published" | "draft" | "unlisted";
  publishedAt: string;
  views: number;
  featured: boolean;
  episodeNumber?: number;
  season?: string;
}

// Pagination Helper
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });
  return (
    <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
        title="Previous"
      >
        Previous
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
          aria-label={`Go to page ${p}`}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
        title="Next"
      >
        Next
      </Button>
    </div>
  );
}

// Status Badge
function VideoStatusBadge({ status }: { status: Video["status"] }) {
  const styles: Record<Video["status"], string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    unlisted: "bg-yellow-100 text-yellow-800",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
}

// Bulk Actions
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
    <div className="flex items-center gap-2 my-2">
      <span className="text-sm text-muted-foreground mr-2">{count} selected</span>
      <Button variant="outline" size="sm" onClick={onPublish}>
        <Upload className="h-4 w-4 mr-1" /> Publish
      </Button>
      <Button variant="outline" size="sm" onClick={onUnpublish}>
        <Archive className="h-4 w-4 mr-1" /> Unpublish
      </Button>
      <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    </div>
  );
}

// Table View (with accessible Tooltips & aria-labels)
function VideoTable({
  videos,
  selected,
  toggleSelect,
  toggleSelectAll,
  onDelete,
  onTogglePublish,
  categories,
}: {
  videos: Video[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (checked: boolean) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  categories: Category[];
}) {
  const allSelected = videos.length > 0 && videos.every((v) => selected.has(v.id));
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-3 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                aria-label="Select all"
              />
            </th>
            <th className="p-3 text-left">Thumbnail</th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left hidden md:table-cell">Category</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left hidden sm:table-cell">Date</th>
            <th className="p-3 text-right hidden sm:table-cell">Views</th>
            <th className="p-3 text-left hidden md:table-cell">Duration</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => {
            const catObj = categories.find((cat) => cat.slug === video.category);
            const isPublished = video.status === "published";
            return (
              <tr key={video.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(video.id)}
                    onChange={() => toggleSelect(video.id)}
                    aria-label={`Select ${video.title}`}
                  />
                </td>
                <td className="p-3">
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail}
                      alt="Thumbnail"
                      width={64}
                      height={40}
                      className="h-10 w-16 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-3 font-medium">
                  <a href={`/admin/video/edit?id=${video.id}`} className="text-blue-600 hover:underline">
                    {video.title}
                  </a>
                </td>
                <td className="p-3 hidden md:table-cell">
                  {catObj?.name || video.category}
                  {catObj?.tooltip && (
                    <span className="ml-1 text-xs text-gray-400" title={catObj.tooltip}>
                      <Info className="inline h-3 w-3" />
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <VideoStatusBadge status={video.status} />
                </td>
                <td className="p-3 hidden sm:table-cell">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right hidden sm:table-cell">{video.views?.toLocaleString() ?? 0}</td>
                <td className="p-3 hidden md:table-cell">{video.duration}</td>
                <td className="p-3 text-right flex flex-wrap gap-2 justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="Edit video"
                        title="Edit"
                      >
                        <a href={`/admin/video/edit?id=${video.id}`}>
                          <Pencil className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="View on site"
                        title="View"
                      >
                        <a href={`/watch/${video.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={isPublished ? "Unpublish video" : "Publish video"}
                        title={isPublished ? "Unpublish" : "Publish"}
                        onClick={() => onTogglePublish(video.id, !isPublished)}
                      >
                        {isPublished ? <Archive className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isPublished ? "Unpublish" : "Publish"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        aria-label="Delete video"
                        title="Delete"
                        onClick={() => onDelete(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Main Component
export function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | Video["status"]>("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const VIDEOS_PER_PAGE = 10;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !filterCategory) {
      setFilterCategory(categories[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [videosRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/videos", { credentials: "include" }),
        fetch("/api/admin/categories?type=video", { credentials: "include" }),
      ]);
      if (!videosRes.ok || !categoriesRes.ok) throw new Error("Failed to load data");
      const videosData = (await videosRes.json()).videos || [];
      const videoCategories = (await categoriesRes.json()).categories || [];
      setVideos(videosData);
      setCategories(videoCategories);
    } catch {
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

  const deleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        toast("Video deleted.");
        await loadData();
        setSelected((prev) => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
      }
    } catch {
      toast("Failed to delete video.");
    }
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
    const matchesCategory = !filterCategory || video.category === filterCategory;
    const matchesStatus = filterStatus === "all" || video.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(filteredVideos.map((v) => v.id)));
    else setSelected(new Set());
  };

  const handleBulk = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} video(s)? This cannot be undone.`)) return;
    for (const id of ids) {
      if (action === "delete") await deleteVideo(id);
      else await togglePublish(id, action === "publish");
    }
    setSelected(new Set());
    await loadData();
  };

  // Filtering, Sorting, Pagination
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return (
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime()
    );
  });

  const totalPages = Math.ceil(sortedVideos.length / VIDEOS_PER_PAGE) || 1;
  const paginatedVideos = sortedVideos.slice(
    (currentPage - 1) * VIDEOS_PER_PAGE,
    currentPage * VIDEOS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Info className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-gray-800">{error}</p>
        <Button onClick={loadData} className="mt-6" aria-label="Retry loading">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Manager</h2>
          <p className="text-gray-600">Manage your YouTube content and episodes</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          aria-label="Add new video"
          title="Add new video"
        >
          Add New Video
        </Button>
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
          categories={categories.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
            count: cat.postCount,
            tooltip: cat.tooltip,
          }))}
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          type="video"
          className="w-full sm:w-48"
        />
        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as "all" | "draft" | "published" | "unlisted")}>
          <SelectTrigger className="w-40" aria-label="Status">
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
          <SelectTrigger className="w-40" aria-label="Sort By">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      <VideoBulkActions
        count={selected.size}
        onPublish={() => handleBulk("publish")}
        onUnpublish={() => handleBulk("unpublish")}
        onDelete={() => handleBulk("delete")}
      />

      {/* Table or Empty State */}
      {paginatedVideos.length === 0 ? (
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
        <VideoTable
          videos={paginatedVideos}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          onDelete={deleteVideo}
          onTogglePublish={togglePublish}
          categories={categories}
        />
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingVideo) && (
        <VideoForm
          video={editingVideo}
          onSave={editingVideo ? (data) => updateVideo(editingVideo.id, data) : createVideo}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingVideo(null);
          }}
          categories={categories}
        />
      )}
    </div>
  );
}
