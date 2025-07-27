"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Video } from "@/lib/types"
import type { Category } from "@/types/category" // <- Use the shared category type

export interface VideoFormProps {
  video?: Partial<Video>
  categories: Category[]
  onSave: (data: Partial<Video>) => void
  onCancel: () => void
}

export function VideoForm({ video, categories, onSave, onCancel }: VideoFormProps) {
  const [formData, setFormData] = useState<Partial<Video>>({
    title: video?.title ?? "",
    slug: video?.slug ?? "",
    youtubeId: video?.youtubeId ?? "",
    thumbnail: video?.thumbnail ?? "",
    description: video?.description ?? "",
    category: video?.category ?? (categories[0]?.slug || ""),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="video-title" className="sr-only">
              Title
            </label>
            <Input
              id="video-title"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="video-slug" className="sr-only">
              Slug
            </label>
            <Input
              id="video-slug"
              name="slug"
              placeholder="Slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="video-youtube" className="sr-only">
              YouTube ID
            </label>
            <Input
              id="video-youtube"
              name="youtubeId"
              placeholder="YouTube ID"
              value={formData.youtubeId}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="video-thumbnail" className="sr-only">
              Thumbnail URL
            </label>
            <Input
              id="video-thumbnail"
              name="thumbnail"
              placeholder="Thumbnail URL"
              value={formData.thumbnail}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="video-description" className="sr-only">
              Description
            </label>
            <Textarea
              id="video-description"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <Select
            value={formData.category}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
