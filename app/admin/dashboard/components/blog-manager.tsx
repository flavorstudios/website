"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RefreshCw,
  PlusCircle,
  AlertCircle,
  SortAsc,
  SortDesc,
  MoreVertical,
  Pencil,
  Eye,
  Archive,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryDropdown } from "@/components/ui/category-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import BlogTableSkeleton from "@/components/admin/blog/BlogTableSkeleton";
import BlogStatusBadge from "@/components/admin/blog/BlogStatusBadge";

import type { BlogPost } from "@/lib/content-store";
import type { CategoryData } from "@/lib/dynamic-categories";
import { revalidateBlogAndAdminDashboard } from "@/app/admin/actions/blog";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/admin/Pagination";
import AdminPageHeader from "@/components/AdminPageHeader";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/use-debounce";
import useMediaQuery from "@/hooks/use-media-query";
import { formatDate } from "@/lib/date";
import { logClientError } from "@/lib/log-client";
import { usePreviewNavigation } from "@/components/admin/blog/usePreviewNavigation";

export default function BlogManager() {
  const { toast } = useToast();
  const [isRevalidating, setIsRevalidating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openPreview, loadingId: previewLoadingId } = usePreviewNavigation();

  const [categories, setCategories] = useState<CategoryData[]>([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);

  // New: track a pending bulk publish/unpublish action for confirmation
  const [bulkAction, setBulkAction] = useState<null | "publish" | "unpublish">(null);

  const isMobile = useMediaQuery("(max-width: 639px)");
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  useEffect(() => {
    setFiltersOpen(!isMobile);
  }, [isMobile]);

  // ---- Read filters/pagination from URL ----
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const sortBy = searchParams.get("sort") ?? "date";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const author = searchParams.get("author") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const perPage = parseInt(searchParams.get("perPage") ?? "10", 10) || 10;

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);
  const [authorInput, setAuthorInput] = useState(author);
  const debouncedAuthor = useDebounce(authorInput, 500);
  const [fromInput, setFromInput] = useState(from);
  const [toInput, setToInput] = useState(to);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setParams({ search: debouncedSearch, page: "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedAuthor !== author) {
      setParams({ author: debouncedAuthor, page: "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAuthor]);

  useEffect(() => {
    setAuthorInput(author);
  }, [author]);

  useEffect(() => {
    setFromInput(from);
  }, [from]);

  useEffect(() => {
    setToInput(to);
  }, [to]);

  // Helper to push updated query params
  const setParams = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    // current values as baseline
    params.set("search", search);
    params.set("category", category);
    params.set("status", status);
    params.set("sort", sortBy);
    params.set("sortDir", sortDir);
    params.set("author", author);
    params.set("from", from);
    params.set("to", to);
    params.set("page", String(currentPage));
    params.set("perPage", String(perPage));
    // apply overrides
    Object.entries(overrides).forEach(([k, v]) => params.set(k, v));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => setSearchInput(value);
  const handleCategoryChange = (value: string) => setParams({ category: value, page: "1" });
  const handleStatusChange = (value: string) => setParams({ status: value, page: "1" });
  const handleSortChange = (value: string) => setParams({ sort: value, page: "1" });
  const handleSortDirToggle = () =>
    setParams({ sortDir: sortDir === "asc" ? "desc" : "asc", page: "1" });
  const handlePerPageChange = (value: string) => setParams({ perPage: value, page: "1" });
  const handlePageChange = (page: number) => setParams({ page: page.toString() });
  const handleAuthorChange = (value: string) => setAuthorInput(value);
  const handleFromDateChange = (value: string) => {
    setFromInput(value);
    setParams({ from: value, page: "1" });
  };
  const handleToDateChange = (value: string) => {
    setToInput(value);
    setParams({ to: value, page: "1" });
  };

  const clearFilters = () => {
    setSearchInput("");
    setAuthorInput("");
    setFromInput("");
    setToInput("");
    setParams({
      search: "",
      category: "all",
      status: "all",
      sort: "date",
      sortDir: "desc",
      author: "",
      from: "",
      to: "",
      page: "1",
      perPage: String(perPage),
    });
  };

  // SWR data sources (server-driven filtering/sorting/pagination)
  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
    mutate: mutatePosts,
  } = useSWR<{ posts: BlogPost[]; total: number }>(
    `/api/admin/blogs?search=${encodeURIComponent(search)}&author=${encodeURIComponent(
      author,
    )}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(
      status,
    )}&sort=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(
      sortDir,
    )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(
      to,
    )}&page=${encodeURIComponent(String(currentPage))}&perPage=${encodeURIComponent(
      String(perPage),
    )}`,
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
        categoriesData.categories.map(
          (
            c: Partial<CategoryData> & { postCount?: number; title?: string },
          ) => ({
            name: c.name ?? c.title ?? "",
            slug: c.slug ?? "",
            order: typeof c.order === "number" ? c.order : 0,
            isActive: c.isActive ?? true,
            count:
              typeof c.count === "number"
                ? c.count
                : typeof c.postCount === "number"
                ? c.postCount
                : 0,
            tooltip: c.tooltip,
          }),
        ),
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
  const displayError = postsError ? "Failed to load blog posts." : null;

  const hasActiveFilters =
    Boolean(search || author || from || to) || category !== "all" || status !== "all";
  const currentPosts = postsData?.posts ?? [];
  const totalPostsCount =
    typeof postsData?.total === "number" ? postsData.total : postsData?.posts?.length ?? 0;

  const categoryErrorMessage =
    categoriesError instanceof Error
      ? categoriesError.message
      : categoriesError
      ? "Failed to load categories."
      : null;
  const refreshData = useCallback(async () => {
    await Promise.all([mutatePosts(), mutateCategories()]);
  }, [mutatePosts, mutateCategories]);

  const handleRevalidateBlog = useCallback(async () => {
    setIsRevalidating(true);
    try {
      const result = await revalidateBlogAndAdminDashboard();
      toast(result.message);
      await refreshData();
    } catch (error) {
      logClientError("Failed to revalidate blog:", error);
      toast("Failed to revalidate blog section.");
    } finally {
      setIsRevalidating(false);
    }
  }, [refreshData, toast]);

  const handleCreatePost = useCallback(() => {
    router.push("/admin/blog/create");
  }, [router]);

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
          logClientError("Delete failed", err);
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
      logClientError("Publish toggle failed", err);
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

  const allSelected = currentPosts.length > 0 && currentPosts.every((p) => selected.has(p.id));

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(currentPosts.map((p) => p.id)));
    } else {
      setSelected(new Set());
    }
  };

  const exportSelected = () => {
    const rows = currentPosts.filter((p) => selected.has(p.id));
    if (rows.length === 0) return;
    const header = ["Title", "Slug", "Status", "Author", "PublishedAt"];
    const csv = [
      header.join(","),
      ...rows.map((p) =>
        [p.title, p.slug, p.status, p.author, p.publishedAt || ""].map((v) =>
          `"${String(v).replace(/"/g, '""')}"`,
        ).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `blog-posts-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        handleRevalidateBlog();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleCreatePost();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRevalidateBlog, handleCreatePost]);

  if (loading) {
    return (
      <div>
        <div className="space-y-1">
          <h2 className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
            Blog Management
          </h2>
          <AdminPageHeader
            as="h1"
            title="Blog Posts"
            subtitle="Create, edit and publish blog posts for Flavor Studios"
          />
        </div>
        <div className="mt-4 space-y-4">
          <div className="sm:hidden space-y-3" data-testid="blog-card-list">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded border border-muted bg-muted/60 animate-pulse" aria-hidden="true" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" aria-hidden="true" />
            </div>

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border bg-white p-4 shadow-sm"
                data-testid="blog-card"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 h-4 w-4 rounded border border-muted bg-muted/60 animate-pulse"
                    aria-hidden="true"
                  />

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-1 items-start gap-3">
                        <div
                          className="h-12 w-16 flex-shrink-0 rounded bg-muted animate-pulse"
                          aria-hidden="true"
                        />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" aria-hidden="true" />
                          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" aria-hidden="true" />
                        </div>
                      </div>

                      <div
                        className="h-9 w-9 rounded bg-muted animate-pulse"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-3 w-16 rounded bg-muted animate-pulse" aria-hidden="true" />
                      <div className="h-3 w-3 rounded-full bg-muted animate-pulse" aria-hidden="true" />
                      <div className="h-3 w-12 rounded bg-muted animate-pulse" aria-hidden="true" />
                      <div className="h-5 w-16 rounded-full bg-muted animate-pulse" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <BlogTableSkeleton />
          </div>
        </div>
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
        <div className="space-y-1">
          <h2 className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
            Blog Management
          </h2>
          <AdminPageHeader
            as="h1"
            title="Blog Posts"
            subtitle="Create, edit and publish blog posts for Flavor Studios"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRevalidateBlog}
            disabled={isRevalidating}
            size="sm"
            className="rounded-xl px-4 flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white"
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
            aria-label="New Post"
            title="New Post"
          >
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {categoryErrorMessage && (
        <Alert variant="destructive" className="mb-4" role="status">
          <AlertDescription>
            {categoryErrorMessage || 'Failed to load categories. Filters may be limited until the feed recovers.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Blog management UI section */}
      <div className={cn("space-y-6", selected.size > 0 && "pb-20 sm:pb-6")}>
        {/* Filters */}
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="blog-filters"
            className="mb-2"
          >
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        )}
        {(!isMobile || filtersOpen) && (
          <div id="blog-filters" className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search title..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:w-60"
              aria-label="Search by title"
            />
            <Input
              placeholder="Author..."
              value={authorInput}
              onChange={(e) => handleAuthorChange(e.target.value)}
              className="w-full sm:w-40"
              aria-label="Filter by author"
            />
            <Input
              type="date"
              value={fromInput}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="w-full sm:w-40"
              aria-label="From date"
            />
            <Input
              type="date"
              value={toInput}
              onChange={(e) => handleToDateChange(e.target.value)}
              className="w-full sm:w-40"
              aria-label="To date"
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
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSortDirToggle}
              aria-label={`Toggle sort direction (currently ${sortDir === "asc" ? "ascending" : "descending"})`}
            >
              {sortDir === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Posts per page">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Bulk Actions */}
        <BlogBulkActions
          count={selected.size}
          onPublish={() => handleBulk("publish")}
          onUnpublish={() => handleBulk("unpublish")}
          onDelete={() => handleBulk("delete")}
          onExport={exportSelected}
        />

        {/* Table or Empty State */}
        {currentPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">
                {hasActiveFilters ? "No posts match your filters" : "No blog posts yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting or clearing your filters to see more results."
                  : "Get started by creating your first blog post for Flavor Studios."}
              </p>
            </div>
            {!hasActiveFilters ? (
              <Button onClick={handleCreatePost} size="sm" aria-label="Create your first post">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create your first post
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={clearFilters} aria-label="Clear filters">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:hidden" data-testid="blog-card-list">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleSelectAll(!!v)}
                  aria-label="Select all posts"
                />
                <span>Select all</span>
              </div>

              {currentPosts.map((post) => {
                const isPublished = post.status === "published";
                return (
                  <div
                    key={post.id}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                    data-testid="blog-card"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        aria-label={`Select blog post: ${post.title}`}
                        checked={selected.has(post.id)}
                        onCheckedChange={() => toggleSelect(post.id)}
                      />

                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-1 items-start gap-3">
                            {post.featuredImage ? (
                              <Image
                                src={post.featuredImage}
                                alt=""
                                aria-hidden="true"
                                width={64}
                                height={40}
                                className="h-12 w-16 flex-shrink-0 rounded object-cover"
                              />
                            ) : null}

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/admin/blog/edit?id=${post.id}`}
                                className="text-sm font-semibold leading-tight hover:underline"
                              >
                                {post.title}
                              </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatDate(post.publishedAt || post.createdAt)}
                              </p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                aria-label={`Open actions for ${post.title}`}
                                aria-haspopup="menu"
                                data-testid="blog-card-actions"
                              >
                                <MoreVertical className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4}>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/blog/edit?id=${post.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                                  <span>Edit</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  void openPreview(post.id);
                                }}
                                disabled={previewLoadingId === post.id}
                              >
                                {previewLoadingId === post.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                  )}
                                <span>
                                  {previewLoadingId === post.id
                                    ? "Loading preview…"
                                    : "Preview"}
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  togglePublish(post.id, !isPublished);
                                }}
                              >
                                {isPublished ? (
                                  <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
                                ) : (
                                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                                )}
                                <span>{isPublished ? "Unpublish" : "Publish"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  deletePost(post.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{post.author}</span>
                          <span aria-hidden="true">•</span>
                          <span>{post.status}</span>
                          <BlogStatusBadge status={post.status as BlogPost["status"]} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block">
              <BlogTable
                posts={currentPosts}
                selected={selected}
                toggleSelect={toggleSelect}
                toggleSelectAll={toggleSelectAll}
                onDelete={deletePost}
                onTogglePublish={togglePublish}
              />
            </div>
          </>
        )}

        {/* Pagination (server-driven) */}
        <Pagination
          currentPage={currentPage}
          totalCount={totalPostsCount}
          perPage={perPage}
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
