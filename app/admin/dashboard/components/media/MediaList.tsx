"use client"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import type { MediaDoc } from "@/types/media"

interface Props {
  items: MediaDoc[]
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
  onRowClick: (item: MediaDoc) => void
}

export default function MediaList({
  items,
  selected,
  toggleSelect,
  toggleSelectAll,
  onRowClick,
}: Props) {
  const allSelected = items.length > 0 && items.every((m) => selected.has(m.id))

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

        {items.map((m) => (
          <div key={m.id} className="border rounded p-3 flex gap-3 items-center">
            <Checkbox
              aria-label={`Select ${m.filename || m.name}`}
              checked={selected.has(m.id)}
              onCheckedChange={() => toggleSelect(m.id)}
            />
            <Image
              src={m.url}
              alt={m.alt || m.filename || m.name}
              width={56}
              height={56}
              className="object-cover rounded w-14 h-14 flex-shrink-0"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => onRowClick(m)}
              className="text-left flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label={`View details for ${m.filename || m.name}`}
            >
              <p className="font-medium truncate text-sm">{m.filename || m.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(m.createdAt).toLocaleDateString()}
              </p>
            </button>
          </div>
        ))}
      </div>

      {/* Table for md and up (your original) */}
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
              <th scope="col" className="p-2 text-left">Type</th>
              <th scope="col" className="p-2 text-left">Date</th>
              <th scope="col" className="p-2 text-left">Size</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2">
                  <Checkbox
                    aria-label={`Select ${m.filename || m.name}`}
                    checked={selected.has(m.id)}
                    onCheckedChange={() => toggleSelect(m.id)}
                  />
                </td>
                <td className="p-2">
                  <Image
                    src={m.url}
                    alt={m.alt || m.filename || m.name}
                    width={40}
                    height={40}
                    className="object-cover rounded"
                    loading="lazy"
                  />
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => onRowClick(m)}
                    className="text-left w-full focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={`View details for ${m.filename || m.name}`}
                  >
                    {m.filename || m.name}
                  </button>
                </td>
                <td className="p-2">{m.mime || m.mimeType}</td>
                <td className="p-2">{new Date(m.createdAt).toLocaleDateString()}</td>
                <td className="p-2">{((m.size || 0) / 1024).toFixed(1)} KB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
