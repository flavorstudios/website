"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import type { MediaDoc } from "@/types/media";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaDetailsDrawerProps {
  media: MediaDoc;
  open: boolean;
  onClose: () => void;

  /** Optional navigation controls; pass these if you support next/prev browsing */
  onPrev?: () => void;
  onNext?: () => void;

  /** Optional update callback to reflect saved changes upstream */
  onUpdate?: (media: MediaDoc) => void;
}

export default function MediaDetailsDrawer({
  media,
  open,
  onClose,
  onPrev,
  onNext,
  onUpdate,
}: MediaDetailsDrawerProps) {
  if (!media) return null;

  const [alt, setAlt] = useState(media.alt || "");
  const [saving, setSaving] = useState(false);

  // Keep local alt in sync when the selected media changes
  useEffect(() => {
    setAlt(media.alt || "");
  }, [media.id, media.alt]);

  const saveAlt = async () => {
    // no-op if nothing changed
    if (alt === (media.alt || "")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/media/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: media.id, alt }),
      });
      if (!res.ok) throw new Error("Failed to save alt text");
      const data = await res.json();
      onUpdate?.(data.media as MediaDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="p-4 space-y-4 max-w-md w-full">
        {(onPrev || onNext) && (
          <div className="flex justify-between">
            {onPrev ? (
              <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}
            {onNext && (
              <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <Image
          src={media.url}
          alt={media.alt || media.filename || media.name || "media"}
          width={400}
          height={400}
          className="object-cover w-full h-auto rounded"
        />

        <div>
          <p className="font-semibold">{media.filename || media.name}</p>
          <p className="text-sm text-gray-500">{media.mime || media.mimeType}</p>
          <p className="text-xs text-gray-400">
            Size: {typeof media.size === "number" ? (media.size / 1024).toFixed(1) : "—"} KB
          </p>
          <p className="text-xs text-gray-400">
            Dimensions: {media.width ?? "?"} × {media.height ?? "?"}
          </p>
          <p className="text-xs text-gray-400">
            Uploaded: {media.createdAt ? new Date(media.createdAt).toLocaleString() : "—"}
          </p>
        </div>

        {!!media.alt && (
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">ALT Text (current)</label>
            <p className="text-xs bg-gray-50 px-2 py-1 rounded">{media.alt}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">ALT Text</label>
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !saving) saveAlt();
            }}
          />
          <Button
            size="sm"
            className="mt-2"
            onClick={saveAlt}
            disabled={saving || alt === (media.alt || "")}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
