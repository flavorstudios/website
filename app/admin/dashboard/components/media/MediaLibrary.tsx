"use client";
import { useEffect, useRef, useState } from "react";
import MediaToolbar from "./MediaToolbar";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";
import MediaUpload from "./MediaUpload";
import MediaBulkActions from "./MediaBulkActions";
import MediaDetailsDrawer from "./MediaDetailsDrawer";
import type { MediaDoc, TypeFilter } from "@/types/media";
import { useToast } from "@/hooks/use-toast";

type SortBy = "date" | "name" | "size";
type DateFilter = "all" | "7d" | "30d";

export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaDoc[]>([]);
  const [cursor, setCursor] = useState<number | null>(null); // Pagination cursor
  const [selectedItem, setSelectedItem] = useState<MediaDoc | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);

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
      const data = await res.json();

      if (typeof nextCursor === "number") {
        setItems((prev) => [...prev, ...((data.media as MediaDoc[]) || [])]);
      } else {
        setItems((data.media as MediaDoc[]) || []);
      }
      setCursor((data.cursor as number | null) ?? null);
    } catch {
      // keep your existing toast API
      toast.error?.("Failed to load media");
    } finally {
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
    // Favorites filter
    .filter((m) => (favoritesOnly ? !!m.favorite : true))
    // Unused filter
    .filter((m) => (unusedOnly ? !m.attachedTo || m.attachedTo.length === 0 : true))
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
      if (sortBy === "name") {
        const an = (a.filename || a.name || "").toString();
        const bn = (b.filename || b.name || "").toString();
        return an.localeCompare(bn);
      }
      if (sortBy === "size") {
        const as = a.size ?? 0;
        const bs = b.size ?? 0;
        return bs - as;
      }
      const aDate =
        typeof a.createdAt === "number"
          ? a.createdAt
          : new Date(a.createdAt).getTime();
      const bDate =
        typeof b.createdAt === "number"
          ? b.createdAt
          : new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

  // Bulk selection logic
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filtered.map((m) => m.id)));
    else setSelectedIds(new Set());
  };

  // Bulk actions (kept as-is; can be upgraded to optimistic + rollback later)
  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    setSelectedIds(new Set());
    void loadMedia();
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
  const handleSelectItem = (item: MediaDoc) => {
    const idx = filtered.findIndex((m) => m.id === item.id);
    setSelectedIndex(idx >= 0 ? idx : null);
    setSelectedItem(item);
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
        dateFilter={dateFilter}
        onDateFilter={setDateFilter}
        unusedOnly={unusedOnly}
        onUnusedToggle={() => setUnusedOnly((u) => !u)}
        view={view}
        onToggleView={() => setView((v) => (v === "grid" ? "list" : "grid"))}
        favoritesOnly={favoritesOnly}
        onFavoritesToggle={() => setFavoritesOnly((f) => !f)}
      />

      {view === "grid" ? (
        <MediaGrid
          items={filtered}
          onSelect={handleSelectItem}
          onPick={onSelect}
          selected={selectedIds}
          toggleSelect={toggleSelect}
          onToggleFavorite={handleToggleFavorite}
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
      />

      {selectedItem && (
        <MediaDetailsDrawer
          media={selectedItem}
          open={true}
          onClose={() => setSelectedItem(null)}
          onPrev={showPrev ? goPrev : undefined}
          onNext={showNext ? goNext : undefined}
          onUpdate={handleUpdateItem}
        />
      )}
    </div>
  );
}
