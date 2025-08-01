"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MediaDoc } from "@/types/media";

export default function MediaUpload({ onUploaded }: { onUploaded: (item: MediaDoc) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      onUploaded(data.media);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mt-4">
      <input type="file" ref={fileRef} className="mb-2" />
      <Button onClick={handleUpload} disabled={uploading} size="sm">
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
}