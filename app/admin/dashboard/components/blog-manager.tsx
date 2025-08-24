"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, PlusCircle, AlertCircle } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryDropdown } from "@/components/ui/category-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import BlogTable from "@/components/admin/blog/BlogTable";
import BlogBulkActions from "@/components/admin/blog/BlogBulkActions";

import type { BlogPost } from "@/lib/content-store";
import type { CategoryData } from "@/lib/dynamic-categories";
import { revalidateBlogAndAdminDashboard } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/admin/Pagination";
import AdminPageHeader from "@/components/AdminPageHeader";
import { fetcher } from "@/lib/fetcher";

export default function BlogManager() {
  const { toast } = useToast();
  const [isRevalidating, setIsRevalidating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const POSTS_PER_PAGE = 10;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);

  // New: track a pending bulk publish/unpublish action for confirmation
  const [bulkAction, setBulkAction] = useState<null | "publish" | "unpublish">(null);

  // ---- Read filters/pagination from URL ----
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const sortBy = searchParams.get("sort") ?? "date";
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  // Helper to push updated query params
  const setParams = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    // current values as baseline
    params.set("search", search);
    params.set("category", category);
    params.set("status", status);
    params.set("sort", sortBy);
    params.set("page", String(currentPage));
    // apply overrides
    Object.entries(overrides).forEach(([k, v]) => params.set(k, v));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => setParams({ search: value, page: "1" });
  const handleCategoryChange = (value: string) => setParams({ category: value, page: "1" });
  const handleStatusChange = (value: string) => setParams({ status: value, page: "1" });
  const handleSortChange = (value: string) => setParams({ sort: value, page: "1" });
  const handlePageChange = (page: number) => setParams({ page: page.toString() });

  // SWR data sources (server-driven filtering/sorting/pagination)
  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
    mutate: mutatePosts,
  } = useSWR<{ posts: BlogPost[]; total: number }>(
    `/api/admin/blogs?search=${encodeURIComponent(search)}&category=${encodeURIComponent(
      category,
    )}&status=${encodeURIComponent(status)}&sort=${encodeURIComponent(
      sortBy,
    )}&page=${encodeURIComponent(String(currentPage))}`,
    fetcher,
    {
      // remove polling; rely on SSE
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
    mutate: mutateCategories,
  } = useSWR<{ categories: Partial<CategoryData>[] }>(
    "/api/admin/categories?type=blog",
    fetcher,
    {
      // remove polling; rely on SSE
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  // Reflect categories into local state
  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(
        categoriesData.categories.map((c: Partial<CategoryData>) => ({
          name: c.name ?? (c as { title?: string }).title ?? "",
          slug: c.slug ?? "",
          order: typeof c.order === "number" ? c.order : 0,
          isActive: c.isActive ?? true,
        })),
      );
    }
  }, [categoriesData]);

  // --- SSE live updates (no manual close on error; let browser auto-reconnect) ---
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/admin/blogs/stream");

      const refreshPosts = () => mutatePosts();
      const refreshCategories = () => mutateCategories();

      es.addEventListener("posts", refreshPosts as EventListener);
      es.addEventListener("categories", refreshCategories as EventListener);

      es.addEventListener("ready", () => {
        // server signaled readiness (optional no-op)
      });

      // Important: don't close here; allow automatic retries
      es.onerror = () => {
        // optionally log with a lightweight console.info
        // console.info("SSE error; browser will attempt to reconnect");
      };
    } catch {
      // ignore if EventSource not supported
    }

    return () => {
      es?.close();
    };
  }, [mutatePosts, mutateCategories]);

  const loading = postsLoading || categoriesLoading;
  const displayError = postsError || categoriesError ? "Failed to load blog posts." : null;

  const refreshData = async () => {
    await Promise.all([mutatePosts(), mutateCategories()]);
  };

  const handleRevalidateBlog = async () => {
    setIsRevalidating(true);
    try {
      const result = await revalidateBlogAndAdminDashboard();
      toast(result.message);
      await refreshData();
    } catch (error) {
      console.error("Failed to revalidate blog:", error);
      toast("Failed to revalidate blog section.");
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleCreatePost = () => {
    router.push("/admin/blog/create");
  };

  // --- DELETE POST MODAL HANDLER (single or bulk) ---
  const deletePost = (id: string) => {
    setDeleteTargets([id]);
  };

  const confirmDelete = async () => {
    if (!deleteTargets) return;

    const targets = [...deleteTargets];
    const results = await Promise.all(
      targets.map(async (id) => {
        try {
          const res = await fetch(`/api/admin/blogs/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (res.ok) {
            return { id, ok: true as const };
          }
          const data = await res.json().catch(() => ({}));
          return { id, ok: false as const, error: data.error || "Failed to delete" };
        } catch (err) {
          console.error("Delete failed", err);
          return { id, ok: false as const, error: "Failed to delete" };
        }
      }),
    );

    const successCount = results.filter((r) => r.ok).length;
    const firstError = results.find((r) => !r.ok)?.error;

    if (successCount > 0) {
      toast(successCount === 1 ? "Post deleted" : `${successCount} posts deleted`);
    }
    if (firstError) {
      toast(firstError);
    }

    setSelected((prev) => {
      const next = new Set(prev);
      results.forEach((r) => {
        if (r.ok) next.delete(r.id);
      });
      return next;
    });

    setDeleteTargets(null);
    await refreshData();
  };

  // Updated: open confirm dialog for publish/unpublish, and refresh once after batch
  const handleBulk = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete") {
      setDeleteTargets(ids);
      return; // confirmation handled by modal
    }
    setBulkAction(action);
  };

  // Updated: remove per-item refresh; do one refresh after batch
  const togglePublish = async (id: string, publish: boolean) => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: publish ? "published" : "draft" }),
      });
      if (res.ok) {
        toast(publish ? "Post published" : "Post unpublished");
      } else {
        const data = await res.json();
        toast(data.error || "Update failed");
      }
    } catch (err) {
      console.error("Publish toggle failed", err);
      toast("Update failed");
    }
  };

  // New: confirm handler for bulk publish/unpublish
  const confirmBulkToggle = async () => {
    if (!bulkAction) return;
    const publish = bulkAction === "publish";
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => togglePublish(id, publish)));
    } finally {
      setSelected(new Set());
      await refreshData();
      setBulkAction(null);
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

  const currentPosts = postsData?.posts ?? [];

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(currentPosts.map((p) => p.id)));
    } else {
      setSelected(new Set());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  // --- Error state (from SWR or actions) ---
  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-gray-800">{displayError}</p>
        <Button onClick={refreshData} className="mt-6" aria-label="Retry loading">
          Retry
        </Button>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div>
      {/* Header with right-aligned action buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <AdminPageHeader
          title="Blog Management"
          subtitle="Manage all blog posts and editorial actions"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleRevalidateBlog}
            disabled={isRevalidating}
            size="sm"
            className="rounded-xl px-4 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            aria-label="Refresh blog posts"
            title="Refresh blog posts"
          >
            <RefreshCw className={`h-4 w-4 ${isRevalidating ? "animate-spin" : ""}`} />
            {isRevalidating ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={handleCreatePost}
            size="sm"
            className="rounded-xl px-4 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
            aria-label="Create new post"
            title="Create new post"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Post
          </Button>
        </div>
      </div>

      {/* Blog management UI section */}
      <div className={cn("space-y-6", selected.size > 0 && "pb-20 sm:pb-6")}>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search title..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full sm:w-60"
            aria-label="Search by title"
          />
          <CategoryDropdown
            categories={categories}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            placeholder="All categories"
            className="w-full sm:w-48"
            aria-label="Category"
          />
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
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

        {/* Bulk Actions */}
        <BlogBulkActions
          count={selected.size}
          onPublish={() => handleBulk("publish")}
          onUnpublish={() => handleBulk("unpublish")}
          onDelete={() => handleBulk("delete")}
        />

        {/* Table or Empty State */}
        {currentPosts.length === 0 ? (
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
              <path
                d="M19 29V35C19 35.5523 19.4477 36 20 36H36C36.5523 36 37 35.5523 37 35V29"
                stroke="#A1A1AA"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="15" y="19" width="26" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2" />
              <circle cx="28" cy="24" r="1.5" fill="#A1A1AA" />
            </svg>
            <span className="text-lg font-medium">No blog posts found</span>
            <span className="text-sm mt-2">Try changing your filters or create a new post.</span>
          </div>
        ) : (
          <BlogTable
            posts={currentPosts}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onDelete={deletePost}
            onTogglePublish={togglePublish}
          />
        )}

        {/* Pagination (server-driven) */}
        <Pagination
          currentPage={currentPage}
          totalCount={postsData?.total ?? 0}
          perPage={POSTS_PER_PAGE}
          onPageChange={handlePageChange}
        />

        {/* Delete Confirmation Modal */}
        {deleteTargets && (
          <AlertDialog open onOpenChange={(open) => !open && setDeleteTargets(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {deleteTargets.length > 1 ? "Posts" : "Post"}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <p>
                Are you sure you want to delete {deleteTargets.length > 1 ? "these" : "this"} post
                {deleteTargets.length > 1 ? "s" : ""}? This action cannot be undone.
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Publish/Unpublish Confirmation Modal */}
        {bulkAction && (
          <AlertDialog open onOpenChange={(open) => !open && setBulkAction(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {bulkAction === "publish" ? "Publish selected posts?" : "Unpublish selected posts?"}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <p>
                This will{" "}
                {bulkAction === "publish"
                  ? "make the selected posts public."
                  : "remove the selected posts from public view."}
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmBulkToggle}>
                  {bulkAction === "publish" ? "Publish" : "Unpublish"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
