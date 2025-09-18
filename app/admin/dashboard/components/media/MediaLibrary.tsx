"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import MediaToolbar from "./MediaToolbar";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";
import MediaUpload from "./MediaUpload";
import MediaBulkActions from "./MediaBulkActions";
import MediaDetailsDrawer from "./MediaDetailsDrawer";
import type {
  MediaDoc,
  TypeFilter,
  SortBy,
  DateFilter,
  UsageFilter,
  SortOrder,
} from "@/types/media";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_MEDIA: MediaDoc[] = [
  {
    id: "fallback-media-1",
    url: "/placeholder.png",
    filename: "placeholder.png",
    name: "Placeholder image",
    alt: "Placeholder media item",
    mime: "image/png",
    size: 20480,
    tags: ["fallback"],
    attachedTo: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const getFallbackMedia = () => FALLBACK_MEDIA.map((item) => ({ ...item }));

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  detailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
}

export default function MediaLibrary({
  onSelect,
  detailsOpen,
  onDetailsOpenChange,
}: MediaLibraryProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaDoc[]>([]);
  const [cursor, setCursor] = useState<number | null>(null); // Pagination cursor
  const [selectedItem, setSelectedItem] = useState<MediaDoc | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(min-width: 768px)").matches ? "list" : "grid";
    }
    return "grid";
  });
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
      if (prefs.view) setView(prefs.view);
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
  const applyFallback = () => {
    setItems(getFallbackMedia());
    setCursor(null);
  };

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
        applyFallback();
        toast.error?.("Failed to load media");
        return;
      }

      const data = await res.json();

      if (typeof nextCursor === "number") {
        setItems((prev) => [...prev, ...((data.media as MediaDoc[]) || [])]);
      } else {
        setItems((data.media as MediaDoc[]) || []);
      }
      setCursor((data.cursor as number | null) ?? null);
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
      applyFallback();
      // keep your existing toast API
      toast.error?.("Failed to load media");
    } finally {
      activeRequestRef.current = null;
      setLoading(false);
    }
  };

  // Handler for Load More
  const loadMore = async () => {
    if (cursor !== null && !loading) {
      await loadMedia(cursor);
    }
  };

  // Infinite scroll using IntersectionObserver with duplicate-fire guard
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || cursor === null) return;

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
  }, [cursor, loading]);

  // Filter, search, and sort logic (null-safe)
  const q = search.trim().toLowerCase();
  const filtered = items
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
    })
    // Sorting
    .sort((a, b) => {
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
    <div className="flex flex-col gap-4" aria-busy={loading}>
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
        <MediaGrid
          items={filtered}
          onSelect={handleSelectItem}
          onPick={onSelect}
          selected={selectedIds}
          toggleSelect={toggleSelect}
          onToggleFavorite={handleToggleFavorite}
          onRefresh={(item) => refreshItem(item.id)}
        />
      ) : (
        <MediaList
          items={filtered}
          onRowClick={handleSelectItem}
          selected={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          onToggleFavorite={handleToggleFavorite}
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
