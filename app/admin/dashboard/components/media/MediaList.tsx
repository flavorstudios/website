"use client"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import type { MediaDoc } from "@/types/media"
import { File as FileIcon, Video as VideoIcon, Star, Music } from "lucide-react"
import { ADMIN_OPEN_MEDIA_UPLOAD } from "@/lib/admin-events"

interface Props {
  items: MediaDoc[]
  selected: Set<string>
  toggleSelect: (id: string, shiftKey?: boolean) => void
  toggleSelectAll: (checked: boolean) => void
  onRowClick: (item: MediaDoc) => void
  onPick?: (url: string) => void
  onToggleFavorite?: (item: MediaDoc) => void
  hasAnyItems?: boolean
}

export default function MediaList({
  items,
  selected,
  toggleSelect,
  toggleSelectAll,
  onRowClick,
  onPick,
  onToggleFavorite,
  hasAnyItems = false,
}: Props) {
  const allSelected = items.length > 0 && items.every((m) => selected.has(m.id))

  const handleActivate = (media: MediaDoc) => {
    onRowClick(media)
    if (media.url) {
      onPick?.(media.url)
    }
  }

  const getPrimaryLabel = (media: MediaDoc) => media.name ?? media.filename ?? "Untitled"

  const Preview = ({ m }: { m: MediaDoc }) => {
    const isImage = m.mime?.startsWith("image/")
    const isVideo = m.mime?.startsWith("video/")
    const isAudio = m.mime?.startsWith("audio/")
    return isImage ? (
      <Image
        src={m.url}
        alt={m.alt || getPrimaryLabel(m)}
        width={56}
        height={56}
        className="object-cover rounded w-14 h-14 flex-shrink-0"
        loading="lazy"
      />
    ) : (
      <div className="flex items-center justify-center w-14 h-14 bg-muted text-muted-foreground rounded flex-shrink-0">
        {isVideo ? (
          <VideoIcon className="w-6 h-6" />
        ) : isAudio ? (
          <Music className="w-6 h-6" />
        ) : (
          <FileIcon className="w-6 h-6" />
        )}
      </div>
    )
  }

  const formatDate = (val: unknown) => {
    if (!val) return "—"
    const n = typeof val === "number" || typeof val === "string" ? new Date(val) : null
    return n && !isNaN(n.getTime()) ? n.toLocaleDateString() : "—"
  }

  const formatSizeKb = (size?: number) => (typeof size === "number" ? (size / 1024).toFixed(1) : "—")

  const openUploader = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(ADMIN_OPEN_MEDIA_UPLOAD));
    }
  }

  const hasItems = items.length > 0
  const showFilteredEmpty = hasAnyItems && !hasItems

  return (
    <>
      {/* Cards for small screens */}
      <div className="md:hidden space-y-2" data-testid="media-card-list">
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            checked={allSelected}
            aria-label="Select all media"
            onCheckedChange={(c) => toggleSelectAll(!!c)}
          />
          <span className="text-xs">Select all</span>
        </div>

        {hasItems ? (
          items.map((m) => (
            <div key={m.id} className="border rounded p-3 flex gap-3 items-center">
              <Checkbox
                aria-label={`Select ${getPrimaryLabel(m)}`}
                checked={selected.has(m.id)}
                onClick={(e) => toggleSelect(m.id, e.shiftKey)}
              />
              <Preview m={m} />
              {onToggleFavorite && (
                <button
                  type="button"
                  className="p-1"
                  aria-label="Toggle favorite"
                  aria-pressed={!!m.favorite}
                  onClick={() => onToggleFavorite(m)}
                >
                  <Star className={m.favorite ? "w-4 h-4 text-yellow-400 fill-yellow-400" : "w-4 h-4 text-gray-500"} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleActivate(m)}
                className="text-left flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                aria-label={`View details for ${getPrimaryLabel(m)}`}
              >
                <p className="font-medium truncate text-sm">{getPrimaryLabel(m)}</p>
                <p className="text-xs text-gray-500">{formatDate(m.createdAt)}</p>
                {m.tags?.length ? (
                  <p className="text-xs text-gray-600 truncate">
                    {m.tags.join(", ")}
                  </p>
                ) : null}
                <p className="text-xs text-gray-600">
                  Used in {m.attachedTo?.length ?? 0} item(s)
                </p>
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col gap-3 rounded border border-dashed border-muted-foreground/40 bg-muted/40 p-4 text-left">
            <p className="text-sm text-muted-foreground">
              {showFilteredEmpty
                ? "No media match your current filters. Try adjusting search or filters."
                : "No media available yet. Upload your first file to get started."}
            </p>
            {!showFilteredEmpty && (
              <button
                type="button"
                className="self-start text-sm font-medium text-primary underline-offset-2 hover:underline"
                onClick={openUploader}
              >
                Upload media
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table for md and up */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="p-2 w-8">
                <Checkbox
                  checked={allSelected}
                  aria-label="Select all"
                  onCheckedChange={(c) => toggleSelectAll(!!c)}
                />
              </th>
              <th scope="col" className="p-2 text-left">Preview</th>
              <th scope="col" className="p-2 text-left">Name</th>
              <th scope="col" className="p-2 text-left">Tags</th>
              <th scope="col" className="p-2 text-left">Used</th>
              <th scope="col" className="p-2 text-left">Type</th>
              <th scope="col" className="p-2 text-left">Date</th>
              <th scope="col" className="p-2 text-left">Size</th>
            </tr>
          </thead>
          <tbody>
            {hasItems ? (
              items.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-2">
                    <Checkbox
                      aria-label={`Select ${getPrimaryLabel(m)}`}
                      checked={selected.has(m.id)}
                      onClick={(e) => toggleSelect(m.id, e.shiftKey)}
                    />
                  </td>
                  <td className="p-2">
                    {/* Reuse the same preview logic for consistency */}
                    <div className="w-10 h-10">
                      <Preview m={m} />
                    </div>
                  </td>
                  <td className="p-2">
                    {onToggleFavorite && (
                      <button
                        type="button"
                        className="mr-2"
                        aria-label="Toggle favorite"
                        aria-pressed={!!m.favorite}
                        onClick={() => onToggleFavorite(m)}
                      >
                        <Star className={m.favorite ? "w-4 h-4 text-yellow-400 fill-yellow-400" : "w-4 h-4 text-gray-500"} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRowClick(m)}
                      className="text-left w-full focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`View details for ${getPrimaryLabel(m)}`}
                    >
                      {getPrimaryLabel(m)}
                    </button>
                  </td>
                  <td className="p-2">{(m.tags ?? []).join(", ")}</td>
                  <td className="p-2">{m.attachedTo?.length ?? 0}</td>
                  <td className="p-2">{m.mime || m.mimeType}</td>
                  <td className="p-2">{formatDate(m.createdAt)}</td>
                  <td className="p-2">{formatSizeKb(m.size)} KB</td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                  {showFilteredEmpty ? (
                    "No media match your current filters."
                  ) : (
                    <>
                      No media available yet.
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                        onClick={openUploader}
                      >
                        Upload media
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
