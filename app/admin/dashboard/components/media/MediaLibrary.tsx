"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import MediaToolbar from "./MediaToolbar";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";
import MediaUpload from "./MediaUpload";
import MediaBulkActions from "./MediaBulkActions";
// Removed Drawer usage per Codex refactor
// import MediaDetailsDrawer from "./MediaDetailsDrawer";
import MediaDetailsPanel from "./MediaDetailsPanel";
import type { MediaDoc } from "@/types/media";
import { toast } from "@/components/ui/toast";
import { usePersistentState } from "@/hooks/usePersistentState";

export interface MediaFilters {
  search: string;
  type: string;       // "all" | mime prefix like "image"
  sort: string;       // "date" | "name"
  month: string;      // "0" = any
  year: string;       // "0" = any
  size: string;       // "all" | "small" | "medium" | "large"
  attached: string;   // "any" | "attached" | "unattached"
  tags: string[];
}

export function buildMediaQuery(filters: MediaFilters & { cursor?: number }): string {
  const params = new URLSearchParams();
  if (filters.cursor) params.set("cursor", String(filters.cursor));
  if (filters.search) params.set("search", filters.search);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.sort !== "date") params.set("sort", filters.sort);
  if (filters.month && filters.month !== "0") params.set("month", filters.month);
  if (filters.year && filters.year !== "0") params.set("year", filters.year);
  if (filters.size && filters.size !== "all") params.set("size", filters.size);
  if (filters.attached !== "any") params.set("attached", filters.attached);
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  return params.toString();
}

export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [items, setItems] = useState<MediaDoc[]>([]);
  const [cursor, setCursor] = useState<number | null>(null); // Pagination cursor
  const [selectedItem, setSelectedItem] = useState<MediaDoc | null>(null);
  const [loading, setLoading] = useState(false);

  // Persisted view mode
  const [view, setView] = usePersistentState<"grid" | "list">("mediaView", "grid");

  // Filter state (synced with URL)
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [month, setMonth] = useState("0");
  const [year, setYear] = useState("0");
  const [size, setSize] = useState("all");
  const [attached, setAttached] = useState("any");
  const [tags, setTags] = useState<string[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // --- Request lifecycle guards (race-safe) ---
  const abortRef = useRef<AbortController | null>(null);
  const reqTokenRef = useRef(0);

  // Pull initial filters from URL (on mount)
  useEffect(() => {
    const sp = searchParams;
    setSearch(sp.get("search") || "");
    setTypeFilter(sp.get("type") || "all");
    setSortBy(sp.get("sort") || "date");
    setMonth(sp.get("month") || "0");
    setYear(sp.get("year") || "0");
    setSize(sp.get("size") || "all");
    setAttached(sp.get("attached") || "any");
    const t = sp.get("tags");
    setTags(t ? t.split(",").filter(Boolean) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFilterQS = useMemo(
    () =>
      buildMediaQuery({
        search,
        type: typeFilter,
        sort: sortBy,
        month,
        year,
        size,
        attached,
        tags,
      }),
    [search, typeFilter, sortBy, month, year, size, attached, tags]
  );

  // Fetch list with current filters (optionally with cursor)
  const loadMedia = useCallback(
    async (nextCursor?: number) => {
      // cancel previous in-flight
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const myToken = ++reqTokenRef.current;

      try {
        setLoading(true);
        const qs = buildMediaQuery({
          search,
          type: typeFilter,
          sort: sortBy,
          month,
          year,
          size,
          attached,
          tags,
          cursor: nextCursor,
        });
        const res = await fetch(`/api/media/list?${qs}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch media");
        // ignore stale responses
        if (myToken !== reqTokenRef.current) return;

        if (nextCursor) {
          // Deduplicate by id when appending
          setItems((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const next = (data.media || []).filter((m: MediaDoc) => !seen.has(m.id));
            return [...prev, ...next];
          });
        } else {
          setItems(data.media || []);
        }
        setCursor(data.cursor ?? null);
      } catch (err: any) {
        if (err?.name === "AbortError") return; // normal during filter changes
        toast.error("Failed to load media");
      } finally {
        if (myToken === reqTokenRef.current) setLoading(false);
      }
    },
    [search, typeFilter, sortBy, month, year, size, attached, tags]
  );

  // Initial load
  useEffect(() => {
    void loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when filters change (bookmarkable links)
  useEffect(() => {
    router.replace(`${pathname}?${currentFilterQS}`);
  }, [currentFilterQS, router, pathname]);

  // Debounced search (300ms)
  useEffect(() => {
    const h = setTimeout(() => void loadMedia(), 300);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Immediate reload for non-search filters
  useEffect(() => {
    void loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, sortBy, month, year, size, attached, tags]);

  // Auto-load more when sentinel becomes visible
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && cursor && !loading) {
          void loadMedia(cursor);
        }
      },
      { rootMargin: "600px 0px" } // prefetch ahead for smoother scroll
    );

    io.observe(el);
    return () => io.disconnect();
  }, [cursor, loading, loadMedia]);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) setSelectedIds(new Set(items.map((m) => m.id)));
    else setSelectedIds(new Set());
  }, [items]);

  // Prune selections that no longer exist after reloads
  useEffect(() => {
    if (!selectedIds.size) return;
    const ids = new Set(items.map((m) => m.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => ids.has(id) && next.add(id));
      return next;
    });
  }, [items, selectedIds.size]);

  // Bulk actions
  const handleBulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    setSelectedIds(new Set());
    void loadMedia();
  }, [selectedIds, loadMedia]);

  const handleBulkTag = useCallback(async () => {
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
    toast.success("Tagged successfully");
    void loadMedia();
  }, [selectedIds, loadMedia]);

  // NEW: Copy URLs (with clipboard fallback)
  const handleBulkCopy = useCallback(async () => {
    const urls = Array.from(selectedIds)
      .map((id) => items.find((i) => i.id === id)?.url)
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(urls);
      } else {
        const ta = document.createElement("textarea");
        ta.value = urls;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast.success("URLs copied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy URLs");
    } finally {
      setSelectedIds(new Set());
    }
  }, [items, selectedIds]);

  // NEW: Move to folder (temporary prompt UX)
  const handleBulkMove = useCallback(async () => {
    const folder = window.prompt("Move to folder:");
    if (!folder) return;
    await fetch("/api/media/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds), folder }),
    });
    setSelectedIds(new Set());
    toast.success("Moved to folder");
    void loadMedia();
  }, [selectedIds, loadMedia]);

  // NEW: Attach to…
  const handleBulkAttach = useCallback(async () => {
    const targetId = window.prompt("Attach to ID:");
    if (!targetId) return;
    await fetch("/api/media/attach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds), targetId }),
    });
    setSelectedIds(new Set());
    toast.success("Attached successfully");
    void loadMedia();
  }, [selectedIds, loadMedia]);

  // NEW: Detach
  const handleBulkDetach = useCallback(async () => {
    await fetch("/api/media/detach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    setSelectedIds(new Set());
    toast.success("Detached successfully");
    void loadMedia();
  }, [selectedIds, loadMedia]);

  // NEW: Download originals (server returns original URLs)
  const handleBulkDownloadOriginals = useCallback(async () => {
    const res = await fetch("/api/media/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    const data = await res.json();
    (data.urls || []).forEach((url: string) => window.open(url, "_blank"));
    setSelectedIds(new Set());
  }, [selectedIds]);

  // Close details if that media is no longer present
  useEffect(() => {
    if (!selectedItem) return;
    const stillThere = items.some((m) => m.id === selectedItem.id);
    if (!stillThere) setSelectedItem(null);
  }, [items, selectedItem]);

  // --- Mobile Pull-to-Refresh with Service Worker ACK (Codex) ---
  useEffect(() => {
    let startY = 0;
    let active = false;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        active = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active) return;
      const dy = e.touches[0].clientY - startY;
      // Ignore small drags / horizontal pans
      if (dy < 60) return;
    };

    const onTouchEnd = async (e: TouchEvent) => {
      if (!active) return;
      active = false;
      const dy = e.changedTouches[0].clientY - startY;
      if (dy >= 60) {
        try {
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            const chan = new MessageChannel();
            const ack = new Promise<void>((resolve) => {
              chan.port1.onmessage = (ev) => {
                if (ev.data?.ok) resolve();
              };
            });
            navigator.serviceWorker.controller.postMessage({ type: "SYNC_MEDIA" }, [chan.port2]);
            // Wait a bit for SW to warm caches; don't block too long
            await Promise.race([ack, new Promise((r) => setTimeout(r, 500))]);
          }
        } finally {
          void loadMedia(); // refresh list after SW sync (if any)
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [loadMedia]);

  return (
    <div className="flex flex-col gap-4">
      <MediaToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
        month={month}
        onMonth={setMonth}
        year={year}
        onYear={setYear}
        size={size}
        onSize={setSize}
        attached={attached}
        onAttached={setAttached}
        tags={tags}
        onTagsChange={setTags}
        view={view}
        onToggleView={() => setView(view === "grid" ? "list" : "grid")}
      />

      {view === "grid" ? (
        <MediaGrid
          items={items}
          onSelect={setSelectedItem}
          onPick={onSelect}
          selected={selectedIds}
          toggleSelect={toggleSelect}
        />
      ) : (
        <MediaList
          items={items}
          onRowClick={setSelectedItem}
          selected={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
        />
      )}

      {/* Auto-load sentinel (replaces manual Load More button) */}
      {cursor && <div ref={loadMoreRef} className="h-6" aria-hidden />}

      <MediaUpload onUploaded={(item) => setItems((i) => [item, ...i])} />

      <MediaBulkActions
        count={selectedIds.size}
        onDelete={handleBulkDelete}
        onTag={handleBulkTag}
        onCopy={handleBulkCopy}
        onMove={handleBulkMove}
        onAttach={handleBulkAttach}
        onDetach={handleBulkDetach}
        onDownloadOriginals={handleBulkDownloadOriginals}
      />

      {selectedItem && (
        <MediaDetailsPanel
          media={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={(fresh) => {
            // keep list and selection in sync after edits/replacement
            setItems((arr) => arr.map((m) => (m.id === fresh.id ? fresh : m)));
            setSelectedItem(fresh);
          }}
        />
      )}
    </div>
  );
}
