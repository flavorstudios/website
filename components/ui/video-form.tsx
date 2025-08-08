"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Video } from "@/lib/types";
import type { Category } from "@/types/category";

// Optional: if this component exists in your project, the button will open it.
// If not, delete the import and the <MediaPickerDialog /> block at the bottom.
import MediaPickerDialog from "@/app/admin/dashboard/components/media/MediaPickerDialog";

export interface VideoFormProps {
  video?: Partial<Video>;
  categories: Category[];
  onSave: (data: Partial<Video>) => void;
  onCancel: () => void;
  /**
   * Optional: lets the parent open a global media picker and feed back the picked URL.
   * If omitted, this form uses its own local MediaPickerDialog.
   */
  onChooseThumbnail?: (setter: (url: string) => void) => void;
}

export function VideoForm({
  video,
  categories,
  onSave,
  onCancel,
  onChooseThumbnail,
}: VideoFormProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState<Partial<Video>>({
    // original fields (kept)
    title: video?.title ?? "",
    slug: video?.slug ?? "",
    youtubeId: video?.youtubeId ?? "",
    thumbnail: video?.thumbnail ?? "",
    description: video?.description ?? "",
    category: video?.category ?? (categories[0]?.slug || ""),
    // new fields
    status: video?.status ?? "draft",
    tags: video?.tags ?? [],
    duration: video?.duration ?? "",
    publishedAt: video?.publishedAt ?? "",
    featured: video?.featured ?? false,
    episodeNumber: video?.episodeNumber,
    season: video?.season ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DDTHH:MM"
    setFormData((prev) => ({
      ...prev,
      publishedAt: val ? new Date(val).toISOString() : "",
    }));
  };

  const toLocalDateTimeInputValue = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    const h = `${d.getHours()}`.padStart(2, "0");
    const min = `${d.getMinutes()}`.padStart(2, "0");
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setFormData((prev) => ({
      ...prev,
      tags: Array.from(new Set([...(prev.tags ?? []), t])),
    }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((t) => t !== tag),
    }));
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput) {
      setFormData((prev) => ({ ...prev, tags: (prev.tags ?? []).slice(0, -1) }));
    }
  };

  const isValidDuration = (s: string) => /^\d{1,2}:\d{2}(?::\d{2})?$/.test(s);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.duration && !isValidDuration(formData.duration)) {
      alert("Duration must be in mm:ss or hh:mm:ss format");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title (unchanged) */}
          <div>
            <label htmlFor="video-title" className="sr-only">
              Title
            </label>
            <Input
              id="video-title"
              name="title"
              placeholder="Title"
              value={formData.title as string}
              onChange={handleChange}
              required
            />
          </div>

          {/* Slug (unchanged) */}
          <div>
            <label htmlFor="video-slug" className="sr-only">
              Slug
            </label>
            <Input
              id="video-slug"
              name="slug"
              placeholder="Slug"
              value={formData.slug as string}
              onChange={handleChange}
              required
            />
          </div>

          {/* YouTube ID (unchanged) */}
          <div>
            <label htmlFor="video-youtube" className="sr-only">
              YouTube ID
            </label>
            <Input
              id="video-youtube"
              name="youtubeId"
              placeholder="YouTube ID"
              value={formData.youtubeId as string}
              onChange={handleChange}
              required
            />
          </div>

          {/* Thumbnail URL (kept) + optional picker */}
          <div>
            <label htmlFor="video-thumbnail" className="sr-only">
              Thumbnail URL
            </label>
            <div className="flex gap-2">
              <Input
                id="video-thumbnail"
                name="thumbnail"
                placeholder="Thumbnail URL"
                value={formData.thumbnail as string}
                onChange={handleChange}
              />
              <Button
                type="button"
                onClick={() => {
                  if (onChooseThumbnail) {
                    // Use parent-provided picker
                    onChooseThumbnail((url) =>
                      setFormData((prev) => ({ ...prev, thumbnail: url }))
                    );
                  } else {
                    // Fallback to local dialog
                    setShowMediaPicker(true);
                  }
                }}
              >
                Select
              </Button>
            </div>
          </div>

          {/* Description (unchanged) */}
          <div>
            <label htmlFor="video-description" className="sr-only">
              Description
            </label>
            <Textarea
              id="video-description"
              name="description"
              placeholder="Description"
              value={formData.description as string}
              onChange={handleChange}
            />
          </div>

          {/* Category (unchanged) */}
          <div>
            <Select
              value={formData.category as string}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
            >
              <SelectTrigger className="w-full" aria-label="Category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NEW: Status */}
          <div>
            <Select
              value={(formData.status as Video["status"]) ?? "draft"}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, status: val as Video["status"] }))
              }
            >
              <SelectTrigger className="w-full" aria-label="Status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* NEW: Tags (simple multi-add) */}
          <div>
            <label htmlFor="video-tags" className="sr-only">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                id="video-tags"
                placeholder="Add tag (Enter or comma)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
              />
              <Button type="button" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    className="ml-1 inline-flex"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* NEW: Duration */}
          <div>
            <label htmlFor="video-duration" className="sr-only">
              Duration
            </label>
            <Input
              id="video-duration"
              name="duration"
              placeholder="Duration (mm:ss or hh:mm:ss)"
              value={formData.duration ?? ""}
              onChange={handleChange}
              pattern="^\d{1,2}:\d{2}(?::\d{2})?$"
              inputMode="numeric"
            />
          </div>

          {/* NEW: Published At */}
          <div>
            <label htmlFor="video-publishedAt" className="sr-only">
              Published At
            </label>
            <Input
              id="video-publishedAt"
              name="publishedAt"
              type="datetime-local"
              value={toLocalDateTimeInputValue(formData.publishedAt as string)}
              onChange={handleDateChange}
            />
          </div>

          {/* NEW: Featured */}
          <div className="flex items-center gap-2">
            <Switch
              id="video-featured"
              checked={Boolean(formData.featured)}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
            />
            <label htmlFor="video-featured">Featured</label>
          </div>

          {/* NEW: Episode Number */}
          <div>
            <label htmlFor="video-episode" className="sr-only">
              Episode Number
            </label>
            <Input
              id="video-episode"
              name="episodeNumber"
              type="number"
              placeholder="Episode Number"
              value={formData.episodeNumber ?? ""}
              onChange={handleChange}
              min={1}
              inputMode="numeric"
            />
          </div>

          {/* NEW: Season */}
          <div>
            <label htmlFor="video-season" className="sr-only">
              Season
            </label>
            <Input
              id="video-season"
              name="season"
              placeholder="Season"
              value={formData.season ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* Actions (kept) */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>

        {/* Optional media picker dialog (fallback if parent didn't provide one) */}
        {!onChooseThumbnail && (
          <MediaPickerDialog
            open={showMediaPicker}
            onOpenChange={setShowMediaPicker}
            onSelect={(url: string) => {
              setFormData((prev) => ({ ...prev, thumbnail: url }));
              setShowMediaPicker(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
