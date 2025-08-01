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
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 w-8">
              <Checkbox
                checked={allSelected}
                aria-label="Select all"
                onCheckedChange={(c) => toggleSelectAll(!!c)}
              />
            </th>
            <th className="p-2 text-left">Preview</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Size</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr
              key={m.id}
              className="border-t hover:bg-gray-50 cursor-pointer focus-visible:bg-blue-50 focus-visible:outline-none"
              tabIndex={0}
              onClick={() => onRowClick(m)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && e.currentTarget === e.target) {
                  e.preventDefault()
                  onRowClick(m)
                }
              }}
            >
              <td className="p-2">
                <Checkbox
                  aria-label={`Select ${m.filename || m.name}`}
                  checked={selected.has(m.id)}
                  onCheckedChange={() => toggleSelect(m.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="p-2">
                <Image src={m.url} alt="" width={40} height={40} className="object-cover rounded" />
              </td>
              <td className="p-2">{m.filename || m.name}</td>
              <td className="p-2">{m.mime || m.mimeType}</td>
              <td className="p-2">{new Date(m.createdAt).toLocaleDateString()}</td>
              <td className="p-2">{((m.size || 0) / 1024).toFixed(1)} KB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}