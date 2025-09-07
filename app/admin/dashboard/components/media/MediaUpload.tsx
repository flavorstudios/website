"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MediaDoc } from "@/types/media";
import { ADMIN_OPEN_MEDIA_UPLOAD } from "@/lib/admin-events";
import { useToast } from "@/hooks/use-toast";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
}

export default function MediaUpload({ onUploaded }: { onUploaded: (item: MediaDoc) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  // Open file dialog when global hotkey fires
  useEffect(() => {
    const openPicker = () => inputRef.current?.click();
    window.addEventListener(ADMIN_OPEN_MEDIA_UPLOAD, openPicker);
    return () => window.removeEventListener(ADMIN_OPEN_MEDIA_UPLOAD, openPicker);
  }, []);

  // Handle file(s) from input or drop
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        const id = Math.random().toString(36).slice(2);
        setUploads((u) => [...u, { id, file, progress: 0 }]);

        const form = new FormData();
        form.append("file", file);
        const xhr = new XMLHttpRequest();

        const cleanup = () =>
          setUploads((u) => u.filter((it) => it.id !== id));
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = (e.loaded / e.total) * 100;
            setUploads((u) =>
              u.map((it) => (it.id === id ? { ...it, progress: pct } : it))
            );
          }
        });

        xhr.onerror = () => {
          toast.error?.("Upload failed");
          cleanup();
        };

        xhr.onabort = () => {
          toast.error?.("Upload aborted");
          cleanup();
        };

        xhr.onload = () => {
          try {
            if (xhr.status >= 400) {
              let message = "Upload failed";
              try {
                const err = JSON.parse(xhr.responseText);
                message = err.error || message;
              } catch {
                // ignore JSON parse errors
              }
              toast.error?.(message);
            } else {
              const data = JSON.parse(xhr.responseText);
              onUploaded(data.media);
            }
          } catch {
            toast.error?.("Upload failed");
          } finally {
            cleanup();
          }
        };

        xhr.open("POST", "/api/media/upload");
        xhr.send(form);
      });
      if (inputRef.current) inputRef.current.value = "";
    },
    [onUploaded, toast]
  );

  // Paste support – allow uploading files via clipboard (e.g. screenshots)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files?.length) {
        handleFiles(e.clipboardData.files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFiles]);

  // Drag and drop handler
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  return (
    <div
      className={cn(
        "mt-4 border border-dashed rounded p-4 text-center cursor-pointer",
        dragging && "bg-muted border-solid"
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      tabIndex={0}
      role="button"
      aria-label="Upload media"
      onPaste={(e) => handleFiles(e.clipboardData?.files || null)}
    >
      <input
        type="file"
        multiple
        hidden
        ref={inputRef}
        accept="image/png,image/jpeg,image/webp,image/gif,video/*,audio/*,application/pdf"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Select media files"
      />
      <p className="text-sm mb-2">
        Drag & drop, click or paste files to upload
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        Only PNG, JPG, WebP, GIF, video, audio or PDF files up to 10 MB
      </p>
      <div aria-live="polite">
        {uploads.map((u) => (
          <div key={u.id} className="mt-2 text-left">
            <span className="text-xs">{u.file.name}</span>
            <Progress value={u.progress} className="mt-1" />
          </div>
        ))}
      </div>
      <Button
        onClick={() => inputRef.current?.click()}
        size="sm"
        variant="outline"
        className="mt-2"
      >
        Select Files
      </Button>
    </div>
  );
}
