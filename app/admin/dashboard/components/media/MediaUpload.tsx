"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MediaDoc } from "@/types/media";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";

type UploadRow = {
  id: string;
  name: string;
  progress: number; // 0..100
  paused: boolean;
  error?: string;
};

export default function MediaUpload({ onUploaded }: { onUploaded: (item: MediaDoc) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uppyRef = useRef<Uppy | null>(null);
  const [rows, setRows] = useState<UploadRow[]>([]);

  // Initialize Uppy once
  useEffect(() => {
    const uppy = new Uppy({ autoProceed: true });

    uppy.use(XHRUpload, {
      endpoint: "/api/media/upload",
      // Enable chunking for resumable uploads
      chunkSize: 5 * 1024 * 1024, // 5MB
      headers(file) {
        const meta = file.meta as any;
        return {
          "x-upload-id": String(file.id),
          "x-file-name": file.name,
          "x-file-type": file.type || "application/octet-stream",
          "x-file-size": String(file.size || 0),
          "x-file-hash": meta.hash || "",
        } as Record<string, string>;
      },
    });

    uppy.on("file-added", (file) => {
      setRows((prev) => [
        ...prev,
        { id: String(file.id), name: file.name, progress: 0, paused: false },
      ]);
    });

    uppy.on("upload-progress", (file, progress) => {
      const pct = (progress.bytesUploaded / progress.bytesTotal) * 100;
      setRows((prev) =>
        prev.map((r) => (r.id === String(file.id) ? { ...r, progress: pct } : r))
      );
    });

    uppy.on("upload-success", (file, resp) => {
      const media = resp?.body?.media as MediaDoc | undefined;
      if (media) onUploaded(media);
      setRows((prev) => prev.filter((r) => r.id !== String(file.id)));
    });

    uppy.on("upload-error", (file, error) => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === String(file.id) ? { ...r, error: error?.message || "Upload failed" } : r
        )
      );
    });

    uppyRef.current = uppy;
    return () => {
      uppy.close();
    };
  }, [onUploaded]);

  // Compute SHA-256, attach to meta, and queue files
  const queueFiles = async (files: FileList | null) => {
    if (!files) return;
    const uppy = uppyRef.current;
    if (!uppy) return;

    for (const file of Array.from(files)) {
      // Client-side hash for duplicate detection and integrity check
      const buf = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const id = uppy.addFile({ name: file.name, type: file.type, data: file });
      uppy.setFileMeta(id, { hash: hashHex });
      // file-added event updates rows[]
    }

    // reset the input to allow re-selecting the same file name
    if (fileRef.current) fileRef.current.value = "";
  };

  // Pause/resume a single upload
  const pauseResume = (id: string) => {
    const uppy = uppyRef.current;
    if (!uppy) return;
    uppy.pauseResume(id);
    const f = uppy.getFile(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, paused: !!f?.isPaused } : r)));
  };

  // Cancel a single upload
  const cancel = (id: string) => {
    const uppy = uppyRef.current;
    if (!uppy) return;
    uppy.removeFile(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Maintain your click-to-upload pattern, and add drag & drop
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    void queueFiles(e.dataTransfer.files);
  };

  return (
    <div className="mt-4">
      {/* Click target & drag-and-drop zone */}
      <div
        className="border border-dashed rounded p-4 text-center cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        tabIndex={0}
        role="button"
        aria-label="Upload media"
      >
        <label htmlFor="media-file-input" className="sr-only">
          Select media files
        </label>
        <input
          id="media-file-input"
          aria-label="Select media files"
          type="file"
          multiple
          ref={fileRef}
          hidden
          onChange={(e) => void queueFiles(e.target.files)}
        />
        <p className="text-sm mb-2">Drag & drop files here or click to select</p>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          Select Files
        </Button>
      </div>

      {/* Upload rows */}
      {rows.map((u) => (
        <div key={u.id} className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs truncate">{u.name}</span>
            <span className="text-xs">{Math.round(u.progress)}%</span>
          </div>
          <Progress
            value={u.progress}
            className="mt-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(u.progress)}
            data-testid="media-upload-progress"
          />
          {u.error && <div className="text-xs text-red-500 mt-1">{u.error}</div>}
          <div className="flex gap-2 mt-2">
            <Button size="xs" onClick={() => pauseResume(u.id)}>
              {u.paused ? "Resume" : "Pause"}
            </Button>
            <Button size="xs" variant="destructive" onClick={() => cancel(u.id)}>
              Cancel
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
