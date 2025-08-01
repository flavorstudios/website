"use client";
import { useEffect, useState } from "react";
import MediaToolbar from "./MediaToolbar";
import MediaGrid from "./MediaGrid";
import MediaUpload from "./MediaUpload";
import MediaDetailsDrawer from "./MediaDetailsDrawer";
import type { MediaDoc } from "@/types/media";
import { toast } from "@/components/ui/toast";

export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const [items, setItems] = useState<MediaDoc[]>([]);
  const [selected, setSelected] = useState<MediaDoc | null>(null);

  useEffect(() => {
    fetch("/api/media/list")
      .then((res) => res.json())
      .then((data) => setItems(data.media || []))
      .catch(() => toast.error("Failed to load media"));
  }, []);

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-4">
        <MediaToolbar />
        <MediaGrid items={items} onSelect={setSelected} onPick={onSelect} />
        <MediaUpload onUploaded={(item) => setItems((i) => [item, ...i])} />
      </div>
      {selected && (
        <MediaDetailsDrawer media={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}