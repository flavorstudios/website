"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import MediaToolbar from "./MediaToolbar";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";
import MediaUpload from "./MediaUpload";
import MediaBulkActions from "./MediaBulkActions";
import MediaDetailsDrawer from "./MediaDetailsDrawer";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import type {
  MediaDoc,
  TypeFilter,
  SortBy,
  DateFilter,
  UsageFilter,
  SortOrder,
} from "@/types/media";
import { useToast } from "@/hooks/use-toast";
import { clientEnv } from "@/env.client";

const isDesktopWidth = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(min-width: 768px)").matches;

const shouldForceListView = () =>
  isDesktopWidth() || (typeof window === "undefined" && clientEnv.TEST_MODE === "true");

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  detailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
}

const E2E_MEDIA_ROWS = [
  {
    id: "e2e-media-1",
    name: "Episode 7 Key Art",
    type: "Image",
    size: "1.8 MB",
    url: "/media/e2e/episode-7-key-art.jpg",
    actionLabel: "Preview",
  },
  {
    id: "e2e-media-2",
    name: "Storyboard Breakdown",
    type: "Video",
    size: "42.3 MB",
    url: "/media/e2e/storyboard-breakdown.mp4",
    actionLabel: "Open",
  },
] as const;

function MediaLibraryE2ETable({
  onSelect,
  onDetailsOpenChange,
}: MediaLibraryProps) {
  const [rows, setRows] = useState<Array<(typeof E2E_MEDIA_ROWS)[number]>>([
    E2E_MEDIA_ROWS[0],
  ]);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const handleLoadMore = () => {
    setRows([...E2E_MEDIA_ROWS]); 
    setHasLoadedMore(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
          Media Management
        </h2>
        <AdminPageHeader
          as="h1"
          title="Media Library"
          subtitle="Manage and organize your uploaded media files"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                File name
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Type
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Size
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.size}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={() => {
                      onSelect?.(row.url);
                      onDetailsOpenChange?.(true);
                    }}
                  >
                    {row.actionLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasLoadedMore && (
        <div>
          <Button type="button" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MediaLibrary({
  onSelect,
  detailsOpen,
  onDetailsOpenChange,
}: MediaLibraryProps) {
  if (clientEnv.NEXT_PUBLIC_E2E === "true") {
    return (
      <MediaLibraryE2ETable
        onSelect={onSelect}
        onDetailsOpenChange={onDetailsOpenChange}
      />
    );
  }
  
  const { toast } = useToast();
  const [items, setItems] = useState<MediaDoc[]>([]);
  const [cursor, setCursor] = useState<number | null>(null); // Pagination cursor
  const [selectedItem, setSelectedItem] = useState<MediaDoc | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<"grid" | "list">(() => {
    if (shouldForceListView()) return "list";
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(min-width: 768px)").matches ? "list" : "grid";
    }
    return "list";
  });
  useEffect(() => {
    if (shouldForceListView()) return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (!mediaQuery.matches) {
      setView("grid");
    }
  }, []);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [hasPaginated, setHasPaginated] = useState(false);

  // Track items currently being refreshed to avoid duplicate calls
  const refreshingIds = useRef<Set<string>>(new Set());

  const refreshItem = useCallback(
    async (id: string) => {
      if (refreshingIds.current.has(id)) return;
      refreshingIds.current.add(id);
      try {
        const res = await fetch("/api/media/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.media) {
          setItems((prev) =>
            prev.map((m) => (m.id === id ? data.media : m)),
          );
          setSelectedItem((prev) =>
            prev && prev.id === id ? (data.media as MediaDoc) : prev,
          );
        }
      } catch {
        // ignore refresh failures
      } finally {
        refreshingIds.current.delete(id);
      }
    },
    [setItems, setSelectedItem],
  );

  const checkExpirations = useCallback(() => {
    const now = Date.now();
    items.forEach((item) => {
      if (item.urlExpiresAt && item.urlExpiresAt - now < 5 * 60 * 1000) {
        void refreshItem(item.id);
      }
    });
  }, [items, refreshItem]);

  // Check on mount and whenever items change
  useEffect(() => {
    checkExpirations();
  }, [items, checkExpirations]);

  // Periodic refresh for long sessions
  useEffect(() => {
    const interval = setInterval(checkExpirations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkExpirations]);


  // Load persisted preferences
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("mediaLibraryPrefs") : null;
    if (!raw) return;
    try {
      const prefs = JSON.parse(raw) as Partial<{
        view: "grid" | "list";
        typeFilter: TypeFilter;
        sortBy: SortBy;
        sortDir: SortOrder;
        dateFilter: DateFilter;
        usageFilter: UsageFilter;
        favoritesOnly: boolean;
        tagFilter: string;
      }>;
      if (prefs.view) {
        const shouldOverrideToList =
          prefs.view === "grid" && shouldForceListView() && isDesktopWidth();
        setView(shouldOverrideToList ? "list" : prefs.view);
      }
      if (prefs.typeFilter) setTypeFilter(prefs.typeFilter);
      if (prefs.sortBy) setSortBy(prefs.sortBy);
      if (prefs.sortDir) setSortDir(prefs.sortDir);
      if (prefs.dateFilter) setDateFilter(prefs.dateFilter);
      if (prefs.usageFilter) setUsageFilter(prefs.usageFilter);
      if (typeof prefs.favoritesOnly === "boolean") setFavoritesOnly(prefs.favoritesOnly);
      if (prefs.tagFilter) setTagFilter(prefs.tagFilter);
    } catch {
      // ignore parsing errors
    }
  }, []);

  // Persist preferences
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefs = {
      view,
      typeFilter,
      sortBy,
      sortDir,
      dateFilter,
      usageFilter,
      favoritesOnly,
      tagFilter,
    };
    localStorage.setItem("mediaLibraryPrefs", JSON.stringify(prefs));
  }, [view, typeFilter, sortBy, sortDir, dateFilter, usageFilter, favoritesOnly, tagFilter]);

  // Reset all filters back to defaults
  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSortBy("date");
    setSortDir("desc");
    setDateFilter("all");
    setUsageFilter("all");
    setFavoritesOnly(false);
    setTagFilter("");
  };

  const filtersActive =
    search !== "" ||
    typeFilter !== "all" ||
    sortBy !== "date" ||
    sortDir !== "desc" ||
    dateFilter !== "all" ||
    usageFilter !== "all" ||
    favoritesOnly ||
    tagFilter !== "";

  // Infinite-scroll sentinel & request guard
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  // Initial load
  useEffect(() => {
    void loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load media with pagination support and abort safety
  const loadMedia = async (nextCursor?: number | null) => {
    if (loading) return;
    setLoading(true);

    // cancel any in-flight request
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      const params = new URLSearchParams();
      if (typeof nextCursor === "number") params.set("cursor", String(nextCursor));
      const res = await fetch(`/api/media/list?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        setItems([]);
        setCursor(null);
        setLoadError(true);
        toast.error?.("Failed to load media");
        return;
      }

      const data = await res.json();
      const media = Array.isArray(data.media) ? (data.media as MediaDoc[]) : [];
      const next = (data.cursor as number | null) ?? null;

      setLoadError(false);

      if (typeof nextCursor !== "number") {
        setItems(media);
        setCursor(next);
        setHasPaginated(false);
        return;
      }

      if (!Array.isArray(data.media)) {
        setCursor(null);
        return;
      }

      if (media.length === 0) {
        setCursor(next);
        return;
      }

      setItems((prev) => [...prev, ...media]);
      setHasPaginated(true);
      setCursor(next);
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
      setItems([]);
      setCursor(null);
      setLoadError(true);
      // keep your existing toast API
      toast.error?.("Failed to load media");
    } finally {
      activeRequestRef.current = null;
      setLoading(false);
      setInitialized(true);
    }
  };

  // Handler for Load More
  const loadMore = async () => {
    if (cursor !== null && !loading) {
      await loadMedia(cursor);
    }
  };

  // Infinite scroll using IntersectionObserver with duplicate-fire guard
  const pageIsScrollable = useCallback(() => {
    if (typeof window === "undefined") return false;
    const root = document.scrollingElement || document.documentElement;
    if (!root) return false;
    return root.scrollHeight > root.clientHeight + 1;
  }, []);

  useEffect(() => {
    if (clientEnv.TEST_MODE === "true") return;
    if (!initialized) return;
    const node = loadMoreRef.current;
    if (!node || cursor === null) return;
    if (!pageIsScrollable() && items.length < 2) return;

    let pending = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !pending && !loading) {
          pending = true;
          void loadMore().finally(() => {
            pending = false;
          });
        }
      },
      { root: null, rootMargin: "400px 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, initialized, items.length, loading, pageIsScrollable]);

  // Filter, search, and sort logic (null-safe)
  const q = search.trim().toLowerCase();
  const filteredBase = items
    // Type filter
    .filter((m) => (typeFilter === "all" ? true : (m.mime?.startsWith(typeFilter) ?? false)))
    // Text search across filename, name, alt, and tags
    .filter((m) => {
      if (!q) return true;
      const fields = [m.filename, m.name, m.alt, ...(m.tags ?? [])]
        .map((v) => (v || "").toLowerCase());
      return fields.some((f) => f.includes(q));
    })
    // Tag filter
    .filter((m) => (tagFilter ? (m.tags ?? []).includes(tagFilter) : true))
    // Favorites filter
    .filter((m) => (favoritesOnly ? !!m.favorite : true))
    // Usage filter
    .filter((m) =>
      usageFilter === "unused"
        ? !m.attachedTo || m.attachedTo.length === 0
        : usageFilter === "used"
        ? !!m.attachedTo && m.attachedTo.length > 0
        : true
    )
    // Date filter
    .filter((m) => {
      if (dateFilter === "all") return true;
      const created =
        typeof m.createdAt === "number"
          ? m.createdAt
          : new Date(m.createdAt).getTime();
      const days = dateFilter === "7d" ? 7 : 30;
      return created >= Date.now() - days * 24 * 60 * 60 * 1000;
    });

    const preserveServerOrder = hasPaginated && sortBy === "date" && sortDir === "desc";

  const filtered = preserveServerOrder
    ? filteredBase
    : [...filteredBase].sort((a, b) => {
        let result = 0;
        if (sortBy === "name") {
          const an = (a.filename || a.name || "").toString();
          const bn = (b.filename || b.name || "").toString();
          result = an.localeCompare(bn);
        } else if (sortBy === "size") {
          const as = a.size ?? 0;
          const bs = b.size ?? 0;
          result = as - bs;
        } else {
          const aDate =
            typeof a.createdAt === "number"
              ? a.createdAt
              : new Date(a.createdAt).getTime();
          const bDate =
            typeof b.createdAt === "number"
              ? b.createdAt
              : new Date(b.createdAt).getTime();
          result = aDate - bDate;
        }
        return sortDir === "asc" ? result : -result;
      });

  const allTags = Array.from(new Set(items.flatMap((m) => m.tags ?? []))).sort();

  // Bulk selection logic
  const toggleSelect = (id: string, shiftKey = false) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (shiftKey && lastSelectedId) {
        const ids = filtered.map((m) => m.id);
        const start = ids.indexOf(lastSelectedId);
        const end = ids.indexOf(id);
        if (start !== -1 && end !== -1) {
          const [min, max] = start < end ? [start, end] : [end, start];
          const shouldSelect = !next.has(id);
          ids.slice(min, max + 1).forEach((rangeId) => {
            if (shouldSelect) next.add(rangeId);
            else next.delete(rangeId);
          });
          return next;
        }
      }

      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setLastSelectedId(id);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filtered.map((m) => m.id)));
    else setSelectedIds(new Set());
  };

  // Bulk actions (kept as-is; can be upgraded to optimistic + rollback later)
  const handleBulkDelete = async () => {
    const failures: string[] = [];
    await Promise.all(
      Array.from(selectedIds).map(async (id) => {
        try {
          const res = await fetch("/api/media/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (!res.ok) throw new Error();
        } catch {
          failures.push(id);
        }
      }),
    );
    setSelectedIds(new Set());
    void loadMedia();
    if (failures.length) {
      toast.error(
        `Failed to delete ${failures.length} item(s): ${failures.join(", ")}`,
      );
    }
  };

  const handleBulkTag = async () => {
    const tag = window.prompt("Tag name");
    if (!tag) return;
    for (const id of selectedIds) {
      await fetch("/api/media/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tags: [tag] }),
      });
    }
    setSelectedIds(new Set());
  };

  const handleBulkDownload = () => {
    selectedIds.forEach((id) => {
      const item = items.find((i) => i.id === id);
      if (item) window.open(item.url, "_blank");
    });
    setSelectedIds(new Set());
  };

  // Favorite toggle (optimistic)
  const handleToggleFavorite = async (item: MediaDoc) => {
    const updated = { ...item, favorite: !item.favorite };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await fetch("/api/media/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, favorite: updated.favorite }),
    }).catch(() => {
      // revert on failure
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    });
  };

  // Selecting an item also stores its index within the filtered set for prev/next
  useEffect(() => {
    if (detailsOpen === false) {
      setSelectedItem(null);
      setSelectedIndex(null);
    }
  }, [detailsOpen]);
  const handleSelectItem = (item: MediaDoc) => {
    const idx = filtered.findIndex((m) => m.id === item.id);
    setSelectedIndex(idx >= 0 ? idx : null);
    setSelectedItem(item);
    onDetailsOpenChange?.(true);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
    setSelectedIndex(null);
    onDetailsOpenChange?.(false);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) handleCloseDetails();
    else onDetailsOpenChange?.(true);
  };

  const handleUpdateItem = (updated: MediaDoc) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelectedItem(updated);
  };

  const showPrev = selectedIndex !== null && selectedIndex > 0;
  const showNext = selectedIndex !== null && selectedIndex < filtered.length - 1;

  const hasAnyItems = items.length > 0;
  const hasFilteredItems = filtered.length > 0;
  const showInitialEmpty = initialized && !loading && !hasAnyItems;
  const showFilteredEmpty = initialized && !loading && hasAnyItems && !hasFilteredItems;

  const renderEmptyState = (message: string) => (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-muted-foreground/40 bg-muted/40 p-6 text-center"
      role="status"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {loadError ? (
        <p className="text-xs text-destructive">Check your connection and try again.</p>
      ) : null}
    </div>
  );

  const goPrev = () => {
    if (!showPrev || selectedIndex === null) return;
    const idx = selectedIndex - 1;
    setSelectedIndex(idx);
    setSelectedItem(filtered[idx]);
  };

  const goNext = () => {
    if (!showNext || selectedIndex === null) return;
    const idx = selectedIndex + 1;
    setSelectedIndex(idx);
    setSelectedItem(filtered[idx]);
  };

  return (
    <div className="space-y-6" aria-busy={loading}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
            Media Management
          </h2>
          <AdminPageHeader
            as="h1"
            title="Media Library"
            subtitle="Manage and organize your uploaded media files"
          />
        </div>
      </div>
      
      <MediaToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
        sortDir={sortDir}
        onSortDirToggle={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        dateFilter={dateFilter}
        onDateFilter={setDateFilter}
        usageFilter={usageFilter}
        onUsageFilter={setUsageFilter}
        view={view}
        onToggleView={() => setView((v) => (v === "grid" ? "list" : "grid"))}
        favoritesOnly={favoritesOnly}
        onFavoritesToggle={() => setFavoritesOnly((f) => !f)}
        tagFilter={tagFilter}
        onTagFilter={setTagFilter}
        availableTags={allTags}
        onResetFilters={handleResetFilters}
        canReset={filtersActive}
      />

      {view === "grid" ? (
        hasFilteredItems ? (
          <MediaGrid
            items={filtered}
            onSelect={handleSelectItem}
            onPick={onSelect}
            selected={selectedIds}
            toggleSelect={toggleSelect}
            onToggleFavorite={handleToggleFavorite}
            onRefresh={(item) => refreshItem(item.id)}
          />
        ) : showInitialEmpty ? (
          renderEmptyState("No media available yet. Upload your first file to get started.")
        ) : showFilteredEmpty ? (
          renderEmptyState("No media match your current filters. Try adjusting search or filters.")
        ) : null
      ) : (
        <MediaList
          items={filtered}
          onRowClick={handleSelectItem}
          onPick={onSelect}
          selected={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          onToggleFavorite={handleToggleFavorite}
          hasAnyItems={hasAnyItems}
        />
      )}

      {/* Infinite-scroll sentinel for tests and observer */}
      <div ref={loadMoreRef} data-testid="media-load-trigger" aria-hidden="true" />

      {/* Accessible fallback button */}
      {cursor !== null && (
        <button
          type="button"
          className="text-sm underline self-center disabled:opacity-50"
          onClick={() => void loadMore()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      <MediaUpload onUploaded={(item) => setItems((i) => [item, ...i])} />
      <MediaBulkActions
        count={selectedIds.size}
        onDelete={handleBulkDelete}
        onTag={handleBulkTag}
        onDownload={handleBulkDownload}
        onClear={() => setSelectedIds(new Set())}
      />

      {selectedItem && (
        <MediaDetailsDrawer
          media={selectedItem}
          open={detailsOpen ?? true}
          onOpenChange={handleDrawerOpenChange}
          onPrev={showPrev ? goPrev : undefined}
          onNext={showNext ? goNext : undefined}
          onUpdate={handleUpdateItem}
        />
      )}
    </div>
  );
}
