"use client"

import { useState, useEffect } from "react"
import CategoryList, { CategoryType } from "./CategoryList"
import type { Category } from "@/types/category"
import CategoryBulkActions from "./CategoryBulkActions"
import IconSelector from "./IconSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Pagination } from "@/components/admin/Pagination"
import { cn } from "@/lib/utils"

interface CategoryFormProps {
  category?: Partial<Category>
  onSave: (data: Partial<Category>) => void
  onCancel: () => void
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    color: category?.color ?? "#6366f1",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIconChange = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color.trim())) {
      toast("Please select a valid hex color.")
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="cat-color">Color</Label>
            <Input
              id="cat-color"
              name="color"
              type="color"
              value={formData.color || "#6366f1"}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="cat-icon">Icon</Label>
            <IconSelector value={formData.icon ?? ""} onChange={handleIconChange} />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              name="description"
              value={formData.description ?? ""}
              onChange={handleChange}
            />
          </div>
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

export default function CategoryManager() {
  const [type, setType] = useState<CategoryType>("BLOG")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("order")
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [replacement, setReplacement] = useState<string>("")
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null)
  const PER_PAGE = 10

  useEffect(() => {
    loadData(type)
  }, [type])

  const loadData = async (t: CategoryType) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories?type=${t.toLowerCase()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      toast("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (data: Partial<Category>) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, type: type.toLowerCase() }),
      })
      if (res.ok) {
        toast("Category created")
        await loadData(type)
        setShowCreate(false)
      } else {
        const d = await res.json()
        toast(d.error || "Failed to create")
      }
    } catch {
      toast("Failed to create")
    }
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast("Category updated")
        await loadData(type)
        setEditing(null)
      } else {
        const d = await res.json()
        toast(d.error || "Update failed")
      }
    } catch {
      toast("Update failed")
    }
  }

  const restoreCategory = async (cat: Category) => {
    const { id, ...rest } = cat
    void id
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(rest),
    })
    await loadData(type)
  }

  // --- Perform Delete (with refresh control for bulk ops)
  const performDelete = async (
    cat: Category,
    replaceId?: string,
    refresh = true
  ) => {
    try {
      const url = replaceId
        ? `/api/admin/categories/${cat.id}/reassign`
        : `/api/admin/categories/${cat.id}`
      const options: RequestInit = {
        method: replaceId ? "POST" : "DELETE",
        credentials: "include",
      }
      if (replaceId) {
        options.headers = { "Content-Type": "application/json" }
        options.body = JSON.stringify({ newCategoryId: replaceId })
      }
      const res = await fetch(url, options)
      if (res.ok) {
        toast(replaceId ? "Category reassigned" : "Category deleted", {
          action: {
            label: "Undo",
            onClick: () => restoreCategory(cat),
          },
        })
        if (refresh) {
          await loadData(type)
        }
      } else {
        const d = await res.json()
        toast(d.error || "Delete failed")
      }
    } catch {
      toast("Delete failed")
    }
  }

  const openDeleteDialog = (cat: Category) => {
    setDeleting(cat)
    setReplacement("")
  }

  const confirmDeleteCategory = async () => {
    if (!deleting) return
    await performDelete(deleting, replacement || undefined)
    setDeleting(null)
    setReplacement("")
  }

  // Bulk Delete (modal, not browser confirm)
  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds) return
    for (const cat of categories.filter((c) => bulkDeleteIds.includes(c.id))) {
      await performDelete(cat, undefined, false)
    }
    setBulkDeleteIds(null)
    setSelected(new Set())
    await loadData(type)
  }

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive }),
      })
      await loadData(type)
    } catch {
      toast("Failed to update")
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(sorted.map((c) => c.id)))
    } else {
      setSelected(new Set())
    }
  }

  const bulkEnable = (ids: string[]) => {
    ids.forEach((id) => toggleStatus(id, true))
    setSelected(new Set())
  }
  const bulkDisable = (ids: string[]) => {
    ids.forEach((id) => toggleStatus(id, false))
    setSelected(new Set())
  }
  // Updated: open a modal dialog instead of browser confirm
  const bulkDelete = (ids: string[]) => {
    if (ids.length === 0) return
    setBulkDeleteIds(ids)
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "status") return Number(b.isActive) - Number(a.isActive)
    return (a.order ?? 0) - (b.order ?? 0)
  })

  const totalPages = Math.ceil(sorted.length / PER_PAGE) || 1
  const paginated = sorted.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy, type])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", selected.size > 0 && "pb-20 sm:pb-4")}>
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
            <SelectTrigger className="w-full sm:w-32" aria-label="Type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BLOG">Blog</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-40"
          />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-32" aria-label="Sort By">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          New Category
        </Button>
      </div>
      <CategoryBulkActions
        count={selected.size}
        onPublish={() => bulkEnable(Array.from(selected))}
        onUnpublish={() => bulkDisable(Array.from(selected))}
        onDelete={() => bulkDelete(Array.from(selected))}
      />
      <CategoryList
        categories={paginated}
        type={type}
        onEdit={(cat) => setEditing(cat)}
        onDelete={openDeleteDialog}
        onToggleStatus={toggleStatus}
        selected={selected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {showCreate && (
        <CategoryForm onSave={createCategory} onCancel={() => setShowCreate(false)} />
      )}
      {editing && (
        <CategoryForm
          category={editing}
          onSave={(data) => updateCategory(editing.id, data)}
          onCancel={() => setEditing(null)}
        />
      )}
      {/* Single Delete dialog with reassignment support */}
      {deleting && (
        <Dialog open onOpenChange={() => setDeleting(null)}>
          <DialogContent className="max-w-md space-y-4">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete {deleting.name}?</p>
            {deleting.postCount && deleting.postCount > 0 && (
              <div className="space-y-2">
                <Label>Reassign posts/videos to:</Label>
                <Select value={replacement} onValueChange={setReplacement}>
                  <SelectTrigger aria-label="Replacement category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.id !== deleting.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  !!(deleting.postCount && deleting.postCount > 0 && !replacement)
                }
                onClick={confirmDeleteCategory}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Bulk Delete Modal */}
      {bulkDeleteIds && (
        <AlertDialog open onOpenChange={(open) => !open && setBulkDeleteIds(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {bulkDeleteIds.length > 1 ? "Categories" : "Category"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <p>
              Are you sure you want to delete {bulkDeleteIds.length > 1 ? "these" : "this"} categor
              {bulkDeleteIds.length > 1 ? "ies" : "y"}?
            </p>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
