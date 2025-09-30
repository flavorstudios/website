"use client";
import Image from "next/image";
import { useState, type SyntheticEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { MediaDoc } from "@/types/media";
import { File, Video, Star, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logClientError } from "@/lib/log-client";

interface Props {
  items: MediaDoc[];
  onSelect: (item: MediaDoc) => void;
  onPick?: (url: string) => void;
  selected?: Set<string>;
  toggleSelect?: (id: string, shiftKey?: boolean) => void;
  /** Optional: pass to show a star button that toggles favorites */
  onToggleFavorite?: (item: MediaDoc) => void;
  /** Optional: refresh a media item (e.g., renew signed URL) */
  onRefresh?: (item: MediaDoc) => Promise<void>;
}

export default function MediaGrid({
  items,
  onSelect,
  onPick,
  selected,
  toggleSelect,
  onToggleFavorite,
  onRefresh,
}: Props) {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleError = async (
    item: MediaDoc,
    event?: SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setFailed((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    const rawSrc = event?.currentTarget?.src;
    const src =
      rawSrc && rawSrc.includes("/_next/image") ? item.url : rawSrc || item.url;
    let status: number | undefined;
    try {
      if (src) {
        const res = await fetch(src, { method: "HEAD" });
        status = res.status;
      }
    } catch (err) {
      status = 0;
      logClientError("Error checking media status", {
        url: item.url,
        err,
      });
    }

    if (
      onRefresh &&
      (status === undefined || status === 0 || status >= 400)
    ) {
      try {
        await onRefresh(item);
        setFailed((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        return;
      } catch {
        // continue to show toast
      }
    }

    let message = "Failed to load media. Check permissions.";
    if (status === 404) message = "File missing";
    else if (status === 401 || status === 403) message = "URL expired";
    else if (status === 0) message = "Network error";

    logClientError("Failed to load media", {
      url: item.url,
      status,
      event,
    });
    toast.error?.(message);
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {items.map((item) => {
        const isSelected = selected?.has(item.id);
        const hasError = failed.has(item.id);
        const mime = item.mime || item.mimeType || "";
        const isImage = mime.startsWith("image/");
        const isVideo = mime.startsWith("video/");
        const isAudio = mime.startsWith("audio/");

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
                  toggleSelect(item.id, e.shiftKey);
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id, e.shiftKey);
                  }}
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
              hasError ? (
                <div className="relative w-full h-32">
                  <Image
                    src="/placeholder.png"
                    alt="placeholder"
                    width={160}
                    height={160}
                    className="object-cover w-full h-32"
                  />
                  <Badge
                    variant="destructive"
                    className="absolute top-1 right-1 z-10 text-[10px] px-1 py-0"
                  >
                    Error
                  </Badge>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt || item.filename || item.name || "media"}
                  width={160}
                  height={160}
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover w-full h-32"
                  loading="lazy"
                  onError={(e) => {
                    void handleError(item, e);
                  }}
                />
              )
            ) : (
              <div className="relative flex items-center justify-center w-full h-32 bg-muted text-muted-foreground">
                {isVideo ? (
                  <Video className="w-8 h-8" />
                ) : isAudio ? (
                  <Music className="w-8 h-8" />
                ) : (
                  <File className="w-8 h-8" />
                )}
                {hasError && (
                  <Badge
                    variant="destructive"
                    className="absolute top-1 right-1 z-10 text-[10px] px-1 py-0"
                  >
                    Error
                  </Badge>
                )}
              </div>
            )}

            {item.tags?.length ? (
              <div className="absolute bottom-1 left-1 z-10 flex flex-wrap gap-1 max-w-full">
                {item.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] px-1 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {item.attachedTo?.length ? (
              <Badge
                variant="secondary"
                className="absolute bottom-1 right-1 z-10 text-[10px] px-1 py-0"
              >
                {item.attachedTo.length}
              </Badge>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
