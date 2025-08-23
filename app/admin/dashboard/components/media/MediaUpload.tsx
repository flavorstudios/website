"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MediaDoc } from "@/types/media";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
}

export default function MediaUpload({ onUploaded }: { onUploaded: (item: MediaDoc) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // Open file dialog when global hotkey fires
  useEffect(() => {
    const openPicker = () => inputRef.current?.click();
    window.addEventListener("admin-open-media-upload", openPicker);
    return () => window.removeEventListener("admin-open-media-upload", openPicker);
  }, []);

  // Handle file(s) from input or drop
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const id = Math.random().toString(36).slice(2);
      setUploads((u) => [...u, { id, file, progress: 0 }]);

      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.length computable) {
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
  };

  // Drag and drop handler
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="mt-4 border border-dashed rounded p-4 text-center cursor-pointer"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      tabIndex={0}
      role="button"
      aria-label="Upload media"
    >
      <input
        type="file"
        multiple
        hidden
        ref={inputRef}
        accept="image/*,video/*,application/pdf"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Select media files"
      />
      <p className="text-sm mb-2">Drag and drop files here or click to select</p>
      {uploads.map((u) => (
        <div key={u.id} className="mt-2 text-left">
          <span className="text-xs">{u.file.name}</span>
          <Progress value={u.progress} className="mt-1" />
        </div>
      ))}
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
