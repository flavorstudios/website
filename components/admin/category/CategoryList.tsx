"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { GripVertical, Edit, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react"
import * as Icons from "lucide-react"
import type { LucideProps } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Category } from "@/types/category"
import useMediaQuery from "@/hooks/use-media-query"

export type CategoryType = "BLOG" | "VIDEO"

export interface CategoryListProps {
  categories: Category[]
  type: CategoryType
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  onDuplicate: (category: Category) => void
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
  sortBy: string
  sortDir: "asc" | "desc"
  onSort: (field: string) => void
}

// --- Helper: Safe icon renderer ---
const renderIcon = (name?: string | null) => {
  if (!name) return null
  if (name.startsWith("http") || name.startsWith("/")) {
    return (
      <Image
        src={name}
        alt=""
        width={16}
        height={16}
        className="w-4 h-4"
        aria-hidden="true"
      />
    )
  }
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name]
  if (!Icon) return null
  return <Icon className="w-4 h-4" aria-hidden="true" />
}

export default function CategoryList({
  categories,
  type,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  selected,
  toggleSelect,
  toggleSelectAll,
  sortBy,
  sortDir,
  onSort,
}: CategoryListProps) {
  const [items, setItems] = useState<Category[]>([])
  const rowRefs = useRef<HTMLTableRowElement[]>([])
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 639px)")

  useEffect(() => {
    setItems([...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
  }, [categories])

  const sensors = useSensors(useSensor(PointerSensor))

  // --- DND Handler with feedback and rollback ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    const prevItems = items
    setItems(newItems)
    try {
      const res = await fetch("/api/admin/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: newItems.map((c) => c.id), type: type.toLowerCase() }),
      })
      if (res.ok) {
        toast("Categories reordered")
      } else {
        const data = await res.json().catch(() => ({}))
        toast(data.error || "Failed to update order")
        setItems(prevItems)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to reorder categories", err)
      toast("Failed to update order")
      setItems(prevItems)
    }
  }

  const allSelected = items.length > 0 && items.every((c) => selected.has(c.id))

  // --- Responsive: Card view for mobile (sm breakpoint < 640px)
  if (isMobile) {
    if (items.length === 0) {
      return (
        <div className="p-6 text-center text-gray-400">No categories found.</div>
      )
    }
    // pb-20 if any selected to avoid overlap with sticky actions
    return (
      <div className={selected.size > 0 ? "pb-20" : ""}>
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(v) => toggleSelectAll(!!v)}
            aria-label="Select all categories"
          />
        <span className="text-xs">Select all</span>
        </div>
        {items.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              selected={selected.has(cat.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onDuplicate={onDuplicate}
              toggleSelect={toggleSelect}
            />
          ))}
        </div>
      )
  }

  // --- Table view for desktop/tablet
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">No categories found.</div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0 z-10">
              <tr>
                <th className="p-3 w-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => toggleSelectAll(!!v)}
                    aria-label="Select all categories"
                  />
                </th>
                <th className="p-3 w-8" />
                <th className="p-3 text-left">
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("name")}
                  >
                    Name
                    {sortBy === "name" &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="p-3 text-left">
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("slug")}
                  >
                    Slug
                    {sortBy === "slug" &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">
                  <button
                    type="button"
                    className="flex items-center gap-1 mx-auto"
                    onClick={() => onSort("status")}
                  >
                    Status
                    {sortBy === "status" &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="p-3 text-right">
                  <button
                    type="button"
                    className="flex items-center gap-1 ml-auto"
                    onClick={() => onSort("posts")}
                  >
                    Posts
                    {sortBy === "posts" &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((cat, idx) => (
                  <SortableRow
                    key={cat.id}
                    category={cat}
                    selected={selected.has(cat.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onDuplicate={onDuplicate}
                    toggleSelect={toggleSelect}
                    rowRef={(el) => (rowRefs.current[idx] = el!)}
                    rowRefs={rowRefs}
                    index={idx}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  )
}

interface SortableRowProps {
  category: Category
  selected: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  onDuplicate: (category: Category) => void
  toggleSelect: (id: string) => void
  rowRef: (el: HTMLTableRowElement | null) => void
  rowRefs: React.MutableRefObject<HTMLTableRowElement[]>
  index: number
}

function CategoryCard({
    category,
    selected,
    onEdit,
    onDelete,
    onToggleStatus,
    onDuplicate,
    toggleSelect,
  }: Omit<SortableRowProps, "rowRef" | "rowRefs" | "index">) {
  return (
    <div className="sm:hidden bg-white border-b last:border-b-0 p-3 flex flex-col gap-2 rounded-lg shadow-sm mt-2">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => toggleSelect(category.id)}
            aria-label={`Select ${category.name}`}
          />
          <span
            className="inline-block w-4 h-4 rounded-full border"
            style={{ backgroundColor: category.color || "#6366f1" }}
            title={category.color || "#6366f1"}
          />
          {renderIcon(category.icon)}
          <span className="font-bold">{category.name}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded ml-2">{category.slug}</span>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded ml-2">{category.type}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Duplicate" onClick={() => onDuplicate(category)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600"
            aria-label="Delete"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div>
          {category.description && (
            <span className="text-gray-700">{category.description}</span>
          )}
          {category.tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 underline cursor-help text-blue-500">?</span>
              </TooltipTrigger>
              <TooltipContent>{category.tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>
            Status:{" "}
            <Switch
              checked={category.isActive}
              onCheckedChange={(v) => onToggleStatus(category.id, !!v)}
              aria-label={`Toggle ${category.name} status`}
            />
          </span>
          <span>Posts: {category.postCount ?? 0}</span>
        </div>
      </div>
    </div>
  )
}

function SortableRow({
    category,
    selected,
    onEdit,
    onDelete,
    onToggleStatus,
    onDuplicate,
    toggleSelect,
    rowRef,
    rowRefs,
    index,
  }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  }

  return (
    <tr
      ref={node => { setNodeRef(node); rowRef(node) }}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          rowRefs.current[index + 1]?.focus()
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          rowRefs.current[index - 1]?.focus()
        }
      }}
      style={style}
      className="border-b last:border-b-0 hover:bg-gray-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <td className="p-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => toggleSelect(category.id)}
          aria-label={`Select ${category.name}`}
        />
      </td>
      <td
        className="p-3 cursor-grab touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag handle"
      >
        <GripVertical className="h-6 w-6 text-gray-400 sm:h-4 sm:w-4" />
      </td>
      <td className="p-3 flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full border"
          style={{ backgroundColor: category.color || "#6366f1" }}
          title={category.color || "#6366f1"}
        />
        {renderIcon(category.icon)}
        <span className="font-medium">{category.name}</span>
        {category.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 underline cursor-help text-blue-500">?</span>
            </TooltipTrigger>
            <TooltipContent>{category.tooltip}</TooltipContent>
          </Tooltip>
        )}
      </td>
      <td className="p-3 text-gray-500">{category.slug}</td>
      <td className="p-3 text-gray-700">
        {category.description || <span className="text-gray-300">—</span>}
      </td>
      <td className="p-3 text-center">
        <Switch
          checked={category.isActive}
          onCheckedChange={(v) => onToggleStatus(category.id, !!v)}
          aria-label={`Toggle ${category.name} status`}
        />
      </td>
      <td className="p-3 text-right">{category.postCount ?? 0}</td>
      <td className="p-3 text-right flex gap-2 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Edit category" title="Edit" onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Duplicate category" title="Duplicate" onClick={() => onDuplicate(category)}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              className="text-red-600"
              aria-label="Delete category"
              title="Delete"
              onClick={() => onDelete(category)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </td>
    </tr>
  )
}
