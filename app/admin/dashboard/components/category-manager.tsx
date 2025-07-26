"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import CategoryBulkActions from "@/components/admin/category/CategoryBulkActions"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
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
  createdAt: string
  updatedAt: string
  postCount?: number | null
}

// Safe client-side error logger (does nothing in prod, logs in dev)
function safeLogError(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args)
  }
}

export function CategoryManager() {
  const [blogCategories, setBlogCategories] = useState<Category[]>([])
  const [videoCategories, setVideoCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createType, setCreateType] = useState<CategoryType>("BLOG")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"BLOG" | "VIDEO">("BLOG")

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const [blogRes, videoRes] = await Promise.all([
        fetch("/api/admin/categories?type=blog", { credentials: "include" }),
        fetch("/api/admin/categories?type=video", { credentials: "include" }),
      ])
      const blogData = await blogRes.json()
      const videoData = await videoRes.json()
      const blogCats: Category[] = (blogData.categories || []).map((cat: Category) => ({
        ...cat,
        name: cat.name ?? cat.title,
      }))
      const videoCats: Category[] = (videoData.categories || []).map((cat: Category) => ({
        ...cat,
        name: cat.name ?? cat.title,
      }))
      setBlogCategories(blogCats)
      setVideoCategories(videoCats)
    } catch (error) {
      setBlogCategories([])
      setVideoCategories([])
      safeLogError("Failed to load categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      const payload = {
        ...categoryData,
        title: categoryData.name,
        tooltip: categoryData.tooltip,
        ...(categoryData.type
          ? { type: categoryData.type.toLowerCase() as Lowercase<CategoryType> }
          : {}),
      }
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (response.ok) {
        await loadCategories()
        setShowCreateForm(false)
        toast({ title: "Category created!" })
      } else {
        const error = await response.json()
        toast(error.error || "Failed to create category")
      }
    } catch (error) {
      safeLogError("Failed to create category:", error)
      toast("Failed to create category")
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const payload = {
        ...categoryData,
        ...(categoryData.name ? { title: categoryData.name } : {}),
        tooltip: categoryData.tooltip,
      }
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (response.ok) {
        await loadCategories()
        setEditingCategory(null)
        toast({ title: "Category updated!" })
      } else {
        const error = await response.json()
        toast(error.error || "Failed to update category")
      }
    } catch (error) {
      safeLogError("Failed to update category:", error)
      toast("Failed to update category")
    }
  }

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        await loadCategories()
        toast({ title: "Category deleted!" })
      } else {
        const error = await response.json()
        toast(error.error || "Failed to delete category")
      }
    } catch (error) {
      safeLogError("Failed to delete category:", error)
      toast("Failed to delete category")
    }
  }

  const toggleCategoryStatus = async (id: string, isActive: boolean) => {
    await updateCategory(id, { isActive })
  }

  // ----------- FILTERING -----------
  const filterCategories = (cats: Category[]) =>
    cats.filter((cat) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        cat.name.toLowerCase().includes(search) ||
        cat.slug.toLowerCase().includes(search)
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? cat.isActive : !cat.isActive)
      return matchesSearch && matchesStatus
    })

  const filteredBlogCategories = filterCategories(blogCategories)
  const filteredVideoCategories = filterCategories(videoCategories)

  // ----------- BULK ACTIONS -----------
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean, cats: Category[]) => {
    if (checked) {
      setSelected(prev => new Set([...prev, ...cats.map(c => c.id)]))
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        cats.forEach(c => next.delete(c.id))
        return next
      })
    }
  }

  const handleBulk = async (
    action: "publish" | "unpublish" | "delete",
    ids: string[],
  ) => {
    if (ids.length === 0) return
    if (action === "delete" && !confirm(`Delete ${ids.length} category(ies)? This cannot be undone.`))
      return
    try {
      if (action === "delete") {
        for (const id of ids) {
          const res = await fetch(`/api/admin/categories/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
          if (!res.ok) {
            const err = await res.json()
            toast(err.error || "Failed to delete category")
          }
        }
      } else {
        const isActive = action === "publish"
        for (const id of ids) {
          const res = await fetch(`/api/admin/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
            credentials: "include",
          })
          if (!res.ok) {
            const err = await res.json()
            toast(err.error || "Failed to update category")
          }
        }
      }
      await loadCategories()
      setSelected(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
    } catch (error) {
      safeLogError("Bulk action failed:", error)
      toast("Bulk action failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Manager</h2>
          <p className="text-gray-600">Manage blog and video categories</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <Input
          placeholder="Search categories…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-60"
          aria-label="Search categories"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs
        defaultValue="BLOG"
        className="space-y-6"
        onValueChange={v => setActiveTab(v as "BLOG" | "VIDEO")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="BLOG">Blog Categories ({filteredBlogCategories.length})</TabsTrigger>
          <TabsTrigger value="VIDEO">Video Categories ({filteredVideoCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="BLOG">
          <CategoryBulkActions
            count={filteredBlogCategories.filter(c => selected.has(c.id)).length}
            onPublish={() =>
              handleBulk(
                "publish",
                filteredBlogCategories.filter(c => selected.has(c.id)).map(c => c.id),
              )
            }
            onUnpublish={() =>
              handleBulk(
                "unpublish",
                filteredBlogCategories.filter(c => selected.has(c.id)).map(c => c.id),
              )
            }
            onDelete={() =>
              handleBulk(
                "delete",
                filteredBlogCategories.filter(c => selected.has(c.id)).map(c => c.id),
              )
            }
          />
          <CategoryList
            categories={filteredBlogCategories}
            type="BLOG"
            onEdit={setEditingCategory}
            onDelete={deleteCategory}
            onToggleStatus={toggleCategoryStatus}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={checked => toggleSelectAll(checked, filteredBlogCategories)}
          />
        </TabsContent>
        <TabsContent value="VIDEO">
          <CategoryBulkActions
            count={filteredVideoCategories.filter(c => selected.has(c.id)).length}
            onPublish={() =>
              handleBulk(
                "publish",
                filteredVideoCategories.filter(c => selected.has(c.id)).map(c => c.id),
              )
            }
            onUnpublish={() =>
              handleBulk(
                "unpublish",
                filteredVideoCategories.filter(c => selected.has(c.id)).map(c => c.id),
              )
            }
            onDelete={() =>
              handleBulk(
                "delete",
                filteredVideoCategories.filter(c => selected.has(c.id)).map(c => c.id),
              )
            }
          />
          <CategoryList
            categories={filteredVideoCategories}
            type="VIDEO"
            onEdit={setEditingCategory}
            onDelete={deleteCategory}
            onToggleStatus={toggleCategoryStatus}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={checked => toggleSelectAll(checked, filteredVideoCategories)}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingCategory) && (
        <CategoryForm
          category={editingCategory}
          type={editingCategory?.type || createType}
          onSave={editingCategory ? (data) => updateCategory(editingCategory.id, data) : createCategory}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingCategory(null)
          }}
          onTypeChange={setCreateType}
        />
      )}
    </div>
  )
}

// ---------- CategoryList (with tooltips/aria-labels) ----------
function CategoryList({
  categories,
  type,
  onEdit,
  onDelete,
  onToggleStatus,
  selected,
  toggleSelect,
  toggleSelectAll,
}: {
  categories: Category[]
  type: CategoryType
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onToggleStatus: (id: string, active: boolean) => void
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
}) {
  const [items, setItems] = useState<Category[]>(categories)
  useEffect(() => {
    setItems(categories)
  }, [categories])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    const ids = newItems.map((c) => c.id)
    const res = await fetch("/api/admin/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, type: type.toLowerCase() }),
      credentials: "include",
    })
    if (res.ok) {
      window.location.reload()
    } else {
      const err = await res.json().catch(() => ({}))
      toast(err.error || "Failed to reorder categories")
    }
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">No categories found.</p>
  }

  const allSelected = items.length > 0 && items.every(c => selected.has(c.id))

  return (
    <div className="overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="w-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={v => toggleSelectAll(!!v)}
                    aria-label="Select all"
                  />
                </th>
                <th className="w-4" />
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Slug</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((cat) => (
                <SortableRow
                  key={cat.id}
                  cat={cat}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  checked={selected.has(cat.id)}
                  onCheck={() => toggleSelect(cat.id)}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableRow({
  cat,
  onEdit,
  onDelete,
  onToggleStatus,
  checked,
  onCheck,
}: {
  cat: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onToggleStatus: (id: string, active: boolean) => void
  checked: boolean
  onCheck: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: cat.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr ref={setNodeRef} style={style} className="cursor-grab">
      <td className="px-1">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheck}
          aria-label={`Select ${cat.name}`}
        />
      </td>
      <td className="px-1">
        <span {...attributes} {...listeners} className="cursor-grab" aria-label={`Drag ${cat.name}`}>
          <GripVertical className="w-4 h-4" />
        </span>
      </td>
      <td className="py-2">{cat.name}</td>
      <td className="py-2">{cat.slug}</td>
      <td className="py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Switch
              aria-label="Active"
              checked={cat.isActive}
              onCheckedChange={(v) => onToggleStatus(cat.id, v)}
            />
          </TooltipTrigger>
          <TooltipContent>
            {cat.isActive ? "Set inactive" : "Set active"}
          </TooltipContent>
        </Tooltip>
      </td>
      <td className="py-2 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(cat)}
              aria-label="Edit category"
              className="mr-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(cat)}
              aria-label="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </td>
    </tr>
  )
}

// ---------- CategoryForm ----------
function CategoryForm({
  category,
  type,
  onSave,
  onCancel,
  onTypeChange,
}: {
  category: Category | null
  type: CategoryType
  onSave: (data: Partial<Category>) => void
  onCancel: () => void
  onTypeChange: (type: CategoryType) => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    tooltip: category?.tooltip || "",
    color: category?.color || "#6366f1",
    type: category?.type || type,
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tooltip: formData.tooltip,
      type: formData.type,
      order: category?.order || 0,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{category ? "Edit Category" : "Create New Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: CategoryType) => {
                  setFormData((prev) => ({ ...prev, type: value }))
                  onTypeChange(value)
                }}
                disabled={!!category}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BLOG">Blog Category</SelectItem>
                  <SelectItem value="VIDEO">Video Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Optional description"
              />
            </div>

            {/* Tooltip Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Tooltip</label>
              <Input
                value={formData.tooltip}
                onChange={(e) => setFormData((prev) => ({ ...prev, tooltip: e.target.value }))}
                placeholder="Short tooltip text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color ?? "#6366f1"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData.color ?? "#6366f1"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    aria-label="Active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                </TooltipTrigger>
                <TooltipContent>Toggle active status</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                {category ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
