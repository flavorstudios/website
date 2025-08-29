"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MediaDoc } from "@/types/media";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
}

export default function MediaUpload({ onUploaded }: { onUploaded: (item: MediaDoc) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  // Open file dialog when global hotkey fires
  useEffect(() => {
    const openPicker = () => inputRef.current?.click();
    window.addEventListener("admin-open-media-upload", openPicker);
    return () => window.removeEventListener("admin-open-media-upload", openPicker);
  }, []);

  // Handle file(s) from input or drop
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const id = Math.random().toString(36).slice(2);
      setUploads((u) => [...u, { id, file, progress: 0 }]);

      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = (e.loaded / e.total) * 100;
          setUploads((u) =>
            u.map((it) => (it.id === id ? { ...it, progress: pct } : it))
          );
        }
      });
      xhr.onload = async () => {
        try {
          const data = JSON.parse(xhr.responseText);
          onUploaded(data.media);
        } finally {
          setUploads((u) => u.filter((it) => it.id !== id));
        }
      };
      xhr.open("POST", "/api/media/upload");
      xhr.send(form);
    });
    if (inputRef.current) inputRef.current.value = "";
  }, [onUploaded]);

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
        accept="image/*,video/*,audio/*,application/*"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Select media files"
      />
      <p className="text-sm mb-2">
        Drag & drop, click or paste files to upload
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
