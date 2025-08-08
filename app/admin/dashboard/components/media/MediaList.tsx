"use client"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import type { MediaDoc } from "@/types/media"
import { useArrowNavigation } from "@/hooks/useArrowNavigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

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

  // Keep your keyboard navigation hook (focus container = tbody)
  const navRef = useArrowNavigation<HTMLTableSectionElement>({ mode: "list" })

  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // approximate row height
    overscan: 5,
  })

  // Roving tabindex across virtualized rows
  const [activeIndex, setActiveIndex] = useState(0)

  // Clamp active index when items change (e.g., filtering)
  useEffect(() => {
    if (!items.length) {
      setActiveIndex(0)
      return
    }
    if (activeIndex > items.length - 1) {
      setActiveIndex(items.length - 1)
    }
  }, [items.length, activeIndex])

  // Focus a row by global index, virtualization-aware
  const focusByIndex = useCallback(
    (idx: number) => {
      if (!items.length) return
      const clamped = Math.max(0, Math.min(idx, items.length - 1))
      setActiveIndex(clamped)
      rowVirtualizer.scrollToIndex(clamped)
      requestAnimationFrame(() => {
        const el = parentRef.current?.querySelector<HTMLElement>(
          `[data-index="${clamped}"]`
        )
        el?.focus()
      })
    },
    [items.length, rowVirtualizer]
  )

  // Keyboard handler on each row
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableRowElement>, idx: number, item: MediaDoc) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          focusByIndex(Math.min(idx + 1, items.length - 1))
          return
        case "ArrowUp":
          e.preventDefault()
          focusByIndex(Math.max(idx - 1, 0))
          return
        case "Home":
          e.preventDefault()
          focusByIndex(0)
          return
        case "End":
          e.preventDefault()
          focusByIndex(items.length - 1)
          return
        case " ":
        case "Enter":
          // Keep your behavior: open details on Enter/Space
          if (e.currentTarget === e.target) {
            e.preventDefault()
            onRowClick(item)
          }
          return
        default:
          return
      }
    },
    [focusByIndex, items.length, onRowClick]
  )

  return (
    <div
      ref={parentRef}
      className="overflow-x-auto border rounded-lg max-h-[60vh]"
      role="region"
      aria-label="Media list"
    >
      <table className="min-w-full text-sm relative" role="table" aria-rowcount={items.length}>
        <thead className="bg-gray-50" role="rowgroup">
          <tr role="row">
            <th className="p-2 w-8" role="columnheader">
              <Checkbox
                checked={allSelected}
                aria-label="Select all"
                onCheckedChange={(c) => toggleSelectAll(!!c)}
              />
            </th>
            <th className="p-2 text-left" role="columnheader">Preview</th>
            <th className="p-2 text-left" role="columnheader">Name</th>
            <th className="p-2 text-left" role="columnheader">Type</th>
            <th className="p-2 text-left" role="columnheader">Date</th>
            <th className="p-2 text-left" role="columnheader">Size</th>
          </tr>
        </thead>

        <tbody
          ref={navRef}
          role="rowgroup"
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
            display: "block",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((row) => {
            const m = items[row.index]
            const isSelected = selected.has(m.id)
            const isActive = row.index === activeIndex

            return (
              <tr
                key={m.id}
                role="row"
                data-media-item
                data-index={row.index}
                aria-rowindex={row.index + 1}
                aria-selected={isSelected}
                className="border-t hover:bg-gray-50 cursor-pointer focus-visible:bg-blue-50 focus-visible:outline-none"
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  onRowClick(m)
                  // maintain keyboard position after click
                  setActiveIndex(row.index)
                }}
                onKeyDown={(e) => handleKeyDown(e, row.index, m)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${row.start}px)`,
                }}
              >
                <td className="p-2" role="cell">
                  <Checkbox
                    aria-label={`Select ${m.filename || (m as any).name}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(m.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="p-2" role="cell">
                  <Image
                    src={m.url}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover rounded"
                  />
                </td>
                <td className="p-2" role="cell">{m.filename || (m as any).name}</td>
                <td className="p-2" role="cell">{m.mime || (m as any).mimeType}</td>
                <td className="p-2" role="cell">{new Date(m.createdAt as any).toLocaleDateString()}</td>
                <td className="p-2" role="cell">{((m.size || 0) / 1024).toFixed(1)} KB</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
