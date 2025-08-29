"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const formatBytes = (b?: number) => {
  if (b === undefined || b === null) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = b;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

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
  const [name, setName] = useState(media.name || media.filename || "");
  const [tagsInput, setTagsInput] = useState((media.tags ?? []).join(", "));
  const [savingAlt, setSavingAlt] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingTags, setSavingTags] = useState(false);

  // Keep local fields in sync when the selected media changes
  useEffect(() => {
    setAlt(media.alt || "");
    setName(media.name || media.filename || "");
    setTagsInput((media.tags ?? []).join(", "));
  }, [media.id, media.alt, media.name, media.filename, media.tags]);

  const saveAlt = async () => {
    const next = alt.trim();
    if (next === (media.alt || "")) return;

    setSavingAlt(true);
    try {
      const res = await fetch("/api/media/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: media.id, alt: next }),
      });
      if (!res.ok) throw new Error("Failed to save alt text");
      const data = await res.json();
      onUpdate?.(data.media as MediaDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAlt(false);
    }
  };

  const saveName = async () => {
    const next = name.trim();
    if (next === (media.name || media.filename || "")) return;

    setSavingName(true);
    try {
      const res = await fetch("/api/media/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: media.id, name: next }),
      });
      if (!res.ok) throw new Error("Failed to save name");
      const data = await res.json();
      onUpdate?.(data.media as MediaDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const saveTags = async () => {
    const next = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (JSON.stringify(next) === JSON.stringify(media.tags ?? [])) return;

    setSavingTags(true);
    try {
      const res = await fetch("/api/media/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: media.id, tags: next }),
      });
      if (!res.ok) throw new Error("Failed to save tags");
      const data = await res.json();
      onUpdate?.(data.media as MediaDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTags(false);
    }
  };

  const mime = media.mime || media.mimeType || "";
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");
  const isPDF = mime === "application/pdf";

  const createdAtMs =
    typeof media.createdAt === "number"
      ? media.createdAt
      : media.createdAt
      ? new Date(media.createdAt).getTime()
      : undefined;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="p-4 space-y-4 max-w-md w-full" aria-label="Media details">
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

        <div className="rounded overflow-hidden">
          {isImage ? (
            <Image
              src={media.url}
              alt={media.alt || media.filename || media.name || "media"}
              width={400}
              height={400}
              sizes="(max-width: 640px) 100vw, 520px"
              className="object-cover w-full h-auto rounded"
            />
          ) : isVideo ? (
            <video
              src={media.url}
              controls
              className="w-full h-auto rounded bg-black"
            />
          ) : isAudio ? (
            <audio
              src={media.url}
              controls
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          ) : isPDF ? (
            <iframe
              src={media.url}
              className="w-full h-64 bg-white"
              title={media.filename || media.name || "PDF preview"}
            />
          ) : (
            <div className="aspect-video w-full grid place-items-center bg-muted text-muted-foreground rounded">
              {mime || "File"}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold break-all">{media.filename || media.name}</p>
          <p className="text-sm text-gray-500">{mime || "Unknown type"}</p>
          <p className="text-xs text-gray-400">Size: {formatBytes(media.size)}</p>
          <p className="text-xs text-gray-400">
            Dimensions: {media.width ?? "?"} × {media.height ?? "?"}
          </p>
          <p className="text-xs text-gray-400">
            Uploaded: {createdAtMs ? new Date(createdAtMs).toLocaleString() : "—"}
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(media.url)}
            >
              Copy URL
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={media.url} download>
                Download
              </a>
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">
            Used in
          </label>
          {media.attachedTo?.length ? (
            <ul className="text-xs list-disc list-inside">
              {media.attachedTo.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">Not used</p>
          )}
        </div>

        {!!media.alt && (
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              ALT Text (current)
            </label>
            <p className="text-xs bg-gray-50 px-2 py-1 rounded break-all">{media.alt}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !savingName) saveName();
            }}
            aria-label="Media name"
          />
          <Button
            size="sm"
            className="mt-2"
            onClick={saveName}
            disabled={savingName || name.trim() === (media.name || media.filename || "")}
          >
            {savingName ? "Saving…" : "Save"}
          </Button>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Tags</label>
          <Input
            value={tagsInput}
            placeholder="tag1, tag2"
            onChange={(e) => setTagsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !savingTags) saveTags();
            }}
            aria-label="Tags"
          />
          <Button
            size="sm"
            className="mt-2"
            onClick={saveTags}
            disabled={savingTags || tagsInput.trim() === (media.tags ?? []).join(", ")}
          >
            {savingTags ? "Saving…" : "Save"}
          </Button>
          {media.tags?.length ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {media.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">ALT Text</label>
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !savingAlt) saveAlt();
            }}
            aria-label="Alternative text"
          />
          <Button
            size="sm"
            className="mt-2"
            onClick={saveAlt}
            disabled={savingAlt || alt.trim() === (media.alt || "")}
          >
            {savingAlt ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
