"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { MediaDoc } from "@/types/media";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface MediaDetailsPanelProps {
  media: MediaDoc;
  open: boolean;
  onClose: () => void;
}

// lightweight, file-local mobile detector (no external deps)
function useIsMobile(query = "(max-width: 640px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);
  return isMobile;
}

export default function MediaDetailsPanel({ media, open, onClose }: MediaDetailsPanelProps) {
  const isMobile = useIsMobile();
  const [local, setLocal] = useState<MediaDoc>(media);
  const [form, setForm] = useState({
    alt: media.alt || "",
    title: media.title || "",
    caption: media.caption || "",
    description: media.description || "",
    tags: media.tags?.join(", ") || "",
  });

  useEffect(() => {
    setLocal(media);
    setForm({
      alt: media.alt || "",
      title: media.title || "",
      caption: media.caption || "",
      description: media.description || "",
      tags: media.tags?.join(", ") || "",
    });
  }, [media]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const payload = {
        id: local.id,
        alt: form.alt,
        title: form.title,
        caption: form.caption,
        description: form.description,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      setLocal((prev) => ({ ...prev, ...payload }));
      try {
        await fetch("/api/media/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [form, local.id]);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("id", local.id);
    fd.append("file", file);
    try {
      const res = await fetch("/api/media/replace", { method: "POST", body: fd });
      const data = await res.json();
      setLocal(data.media);
    } catch {
      // ignore
    }
  };

  const copy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  if (!local) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex w-full max-w-md space-y-4 p-4"
        aria-label="Attachment details"
      >
        <SheetHeader>
          <SheetTitle className="truncate">{local.filename || local.name || "Attachment"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 gap-3 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            <Image
              src={local.url}
              alt={local.alt || local.name || ""}
              width={800}
              height={600}
              className="w-full h-auto rounded object-contain"
              priority={isMobile}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="button" className="h-12 px-4" onClick={() => copy(local.url)}>
                Copy URL
              </Button>
              <Button type="button" className="h-12 px-4" onClick={() => copy(local.cdnUrl || local.url)}>
                Copy CDN URL
              </Button>
              <Button asChild variant="outline" className="h-12 px-4">
                <a href={local.url} download>
                  Download original
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">ALT Text</label>
              <Input aria-label="ALT Text" value={form.alt} onChange={handleChange("alt")} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">Title</label>
              <Input aria-label="Title" value={form.title} onChange={handleChange("title")} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">Caption</label>
              <Textarea aria-label="Caption" value={form.caption} onChange={handleChange("caption")} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">Description</label>
              <Textarea
                aria-label="Description"
                value={form.description}
                onChange={handleChange("description")}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">Tags</label>
              <Input aria-label="Tags" value={form.tags} onChange={handleChange("tags")} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">Replace File</label>
              <Input aria-label="Replace File" type="file" onChange={handleReplace} />
            </div>
          </div>

          {local.versions && local.versions.length > 0 && (
            <aside className="hidden w-32 shrink-0 overflow-y-auto border-l pl-2 sm:block">
              <p className="mb-2 text-xs font-semibold">Version History</p>
              <ul className="space-y-1">
                {local.versions.map((v, i) => (
                  <li key={i}>
                    <a className="text-xs underline" href={v.url} target="_blank" rel="noreferrer">
                      {v.replacedAt
                        ? new Date(v.replacedAt).toLocaleDateString()
                        : `Version ${i + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
