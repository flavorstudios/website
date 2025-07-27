"use client"

import { useState, useEffect, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { GripVertical, Edit, Trash2 } from "lucide-react"
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
import { toast } from "@/hooks/use-toast"

export type CategoryType = "BLOG" | "VIDEO"

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  description?: string | null
  tooltip?: string | null
  color?: string | null
  icon?: string | null
  order: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  postCount?: number | null
}

export interface CategoryListProps {
  categories?: Category[] | null // Defensive!
  type: CategoryType
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
}

// --- Responsive Card for Mobile ---
function CategoryCard({
  category,
  selected,
  onEdit,
  onDelete,
  onToggleStatus,
  toggleSelect,
}: Omit<SortableRowProps, "attributes" | "listeners" | "setNodeRef" | "transform" | "transition">) {
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
          <span className="font-bold">{category.name}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded ml-2">{category.slug}</span>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded ml-2">{category.type}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4" />
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

// --- Main Table/List ---
export default function CategoryList({
  categories,
  type,
  onEdit,
  onDelete,
  onToggleStatus,
  selected,
  toggleSelect,
  toggleSelectAll,
}: CategoryListProps) {
  const categoryArray = useMemo(() => Array.isArray(categories) ? categories : [], [categories])
  const [items, setItems] = useState<Category[]>([])
  const [width, setWidth] = useState<number>(1024)

  useEffect(() => {
    setItems([...categoryArray].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
  }, [categoryArray])

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    try {
      await fetch("/api/admin/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: newItems.map((c) => c.id), type: type.toLowerCase() }),
      })
    } catch {
      toast("Failed to reorder categories")
    }
  }

  const allSelected = items.length > 0 && items.every((c) => selected.has(c.id))

  // --- Responsive: Card view for mobile (sm breakpoint < 640px)
  if (width < 640) {
    if (items.length === 0) {
      return (
        <div className="p-6 text-center text-gray-400">No categories found.</div>
      )
    }
    return (
      <div>
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
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Posts</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((cat) => (
                <SortableRow
                  key={cat.id}
                  category={cat}
                  selected={selected.has(cat.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  toggleSelect={toggleSelect}
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
  toggleSelect: (id: string) => void
  // dndProps REMOVED (was unused)
}

function SortableRow({
  category,
  selected,
  onEdit,
  onDelete,
  onToggleStatus,
  toggleSelect,
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
    <tr ref={setNodeRef} style={style} className="border-b last:border-b-0 hover:bg-gray-50">
      <td className="p-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => toggleSelect(category.id)}
          aria-label={`Select ${category.name}`}
        />
      </td>
      <td className="p-3 cursor-grab" {...attributes} {...listeners} aria-label="Drag handle">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </td>
      {/* --- Name + Color badge + Tooltip on hover --- */}
      <td className="p-3 flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full border"
          style={{ backgroundColor: category.color || "#6366f1" }}
          title={category.color || "#6366f1"}
        />
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
