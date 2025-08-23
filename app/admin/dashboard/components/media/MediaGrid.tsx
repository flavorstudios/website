"use client";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import type { MediaDoc } from "@/types/media";
import { File, Video, Star } from "lucide-react";

interface Props {
  items: MediaDoc[];
  onSelect: (item: MediaDoc) => void;
  onPick?: (url: string) => void;
  selected?: Set<string>;
  toggleSelect?: (id: string) => void;
  /** Optional: pass to show a star button that toggles favorites */
  onToggleFavorite?: (item: MediaDoc) => void;
}

export default function MediaGrid({
  items,
  onSelect,
  onPick,
  selected,
  toggleSelect,
  onToggleFavorite,
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {items.map((item) => {
        const isSelected = selected?.has(item.id);
        const mime = item.mime || item.mimeType || "";
        const isImage = mime.startsWith("image/");
        const isVideo = mime.startsWith("video/");

        return (
          <button
            key={item.id}
            type="button"
            className="relative border rounded overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              onSelect(item);
              onPick?.(item.url);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSelect(item);
                onPick?.(item.url);
              }
              if (e.key === " ") {
                // Space toggles bulk selection when available
                if (toggleSelect) {
                  e.preventDefault();
                  toggleSelect(item.id);
                }
              }
            }}
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={item.filename || item.name || "media item"}
          >
            {/* Bulk selection checkbox, if enabled */}
            {toggleSelect && (
              <div className="absolute top-1 left-1 z-10 bg-white rounded">
                <Checkbox
                  aria-label={`Select ${item.filename || item.name}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Favorite toggle (optional) */}
            {onToggleFavorite && (
              <button
                type="button"
                className="absolute top-1 right-1 z-10 p-1 bg-white rounded"
                aria-label="Toggle favorite"
                aria-pressed={!!item.favorite}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item);
                }}
              >
                <Star
                  className={
                    item.favorite
                      ? "w-4 h-4 text-yellow-400 fill-yellow-400"
                      : "w-4 h-4 text-gray-500"
                  }
                />
              </button>
            )}

            {/* Preview */}
            {isImage ? (
              <Image
                src={item.url}
                alt={item.alt || item.filename || item.name || "media"}
                width={160}
                height={160}
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover w-full h-32"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-32 bg-muted text-muted-foreground">
                {isVideo ? <Video className="w-8 h-8" /> : <File className="w-8 h-8" />}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
