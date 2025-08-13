"use client";
import { useEffect, useState } from "react";
import MediaToolbar from "./MediaToolbar";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";
import MediaUpload from "./MediaUpload";
import MediaBulkActions from "./MediaBulkActions";
import MediaDetailsDrawer from "./MediaDetailsDrawer";
import type { MediaDoc } from "@/types/media";
import { useToast } from "@/hooks/use-toast";

export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaDoc[]>([]);
  const [cursor, setCursor] = useState<number | null>(null); // Pagination cursor
  const [selectedItem, setSelectedItem] = useState<MediaDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Initial load
  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load media with pagination support
  const loadMedia = async (nextCursor?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (nextCursor) params.set("cursor", String(nextCursor));
      const res = await fetch(`/api/media/list?${params.toString()}`);
      const data = await res.json();
      if (nextCursor) {
        setItems((prev) => [...prev, ...(data.media || [])]);
      } else {
        setItems(data.media || []);
      }
      setCursor(data.cursor || null);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  // Handler for Load More
  const loadMore = () => {
    if (cursor && !loading) loadMedia(cursor);
  };

  // Filter, search, and sort logic
  const filtered = items
    .filter((m) => (typeFilter === "all" ? true : m.mime?.startsWith(typeFilter)))
    .filter((m) =>
      (m.filename || m.name || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return (a.filename || a.name).localeCompare(b.filename || b.name);
      return (b.createdAt || 0) - (a.createdAt || 0);
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

  // Bulk actions
  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    setSelectedIds(new Set());
    loadMedia();
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

  return (
    <div className="flex flex-col gap-4">
      <MediaToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
        view={view}
        onToggleView={() => setView(view === "grid" ? "list" : "grid")}
      />
      {view === "grid" ? (
        <MediaGrid
          items={filtered}
          onSelect={setSelectedItem}
          onPick={onSelect}
          selected={selectedIds}
          toggleSelect={toggleSelect}
        />
      ) : (
        <MediaList
          items={filtered}
          onRowClick={setSelectedItem}
          selected={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
        />
      )}
      {cursor && (
        <button
          type="button"
          className="text-sm underline"
          onClick={loadMore}
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
        <MediaDetailsDrawer media={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
