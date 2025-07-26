"use client"

import { useState, useEffect } from "react"
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
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
  categories: Category[]
  type: CategoryType
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
}

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
  const [items, setItems] = useState<Category[]>([])

  useEffect(() => {
    setItems([...categories].sort((a, b) => a.order - b.order))
  }, [categories])

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
    } catch (err) {
      console.error("Failed to reorder categories", err)
    }
  }

  const allSelected = items.length > 0 && items.every((c) => selected.has(c.id))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
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
    transform: CSS.Transform.toString(transform),
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
      <td className="p-3">{category.name}</td>
      <td className="p-3 text-gray-500">{category.slug}</td>
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
