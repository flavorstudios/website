"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import CategoryList, { CategoryType } from "./CategoryList"
import type { Category } from "@/types/category"
import CategoryBulkActions from "./CategoryBulkActions"
import IconSelector from "./IconSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/admin/Pagination"
import { cn } from "@/lib/utils"
import AdminPageHeader from "@/components/AdminPageHeader"
import { slugify } from "@/lib/slugify"
import useHotkeys from "@/app/admin/dashboard/hooks/use-hotkeys"
import useDebounce from "@/hooks/use-debounce"

interface CategoryFormProps {
  category?: Partial<Category>
  onSave: (data: Partial<Category>) => void
  onCancel: () => void
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    color: category?.color ?? "#6366f1",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
    tooltip: category?.tooltip ?? "",
  })
  const [slugEdited, setSlugEdited] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name === "slug") {
      setSlugEdited(true)
      setFormData((prev) => ({ ...prev, slug: slugify(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  useEffect(() => {
    if (!slugEdited) {
      setFormData((prev) => {
        const newSlug = slugify(prev.name ?? "")
        if (prev.slug === newSlug) return prev
        return { ...prev, slug: newSlug }
      })
    }
  }, [formData.name, slugEdited])

  const handleIconChange = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.slug) {
      toast("Slug is required")
      return
    }
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
          <div>
            <Label htmlFor="cat-tooltip">Tooltip</Label>
            <Input
              id="cat-tooltip"
              name="tooltip"
              value={formData.tooltip ?? ""}
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
  const { toast } = useToast()

  const getInitialPrefs = () => {
    if (typeof window === "undefined") return {}
    try {
      return JSON.parse(localStorage.getItem("cm_prefs") || "{}")
    } catch {
      return {}
    }
  }
  const prefsRef = useRef(getInitialPrefs())
  const prefs = prefsRef.current

  const [type, setType] = useState<CategoryType>(prefs.type ?? "BLOG")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(prefs.search ?? "")
  const [sortBy, setSortBy] = useState(prefs.sortBy ?? "order")
  const [sortDir, setSortDir] = useState<"asc" | "desc">(prefs.sortDir ?? "asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [replacement, setReplacement] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    prefs.statusFilter ?? "all",
  )
  const [perPage, setPerPage] = useState<number>(
    typeof prefs.perPage === "number" ? prefs.perPage : 10,
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [importing, setImporting] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const parseCSV = (text: string): Partial<Category>[] => {
    const [headerLine, ...lines] = text.trim().split(/\r?\n/)
    const headers = headerLine
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""))
    return lines
      .filter(Boolean)
      .map((line) => {
        const values = line
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, "").replace(/""/g, '"'))
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => (obj[h] = values[i] ?? ""))
        return {
          name: obj.Name,
          slug: obj.Slug,
          description: obj.Description || undefined,
          color: obj.Color || undefined,
          icon: obj.Icon || undefined,
          isActive: obj.Status
            ? obj.Status.toLowerCase() === "active"
            : true,
        }
      })
  }

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortBy(field)
        setSortDir("asc")
      }
    },
    [sortBy],
  )

  useEffect(() => {
    const nextPrefs = {
      type,
      search,
      sortBy,
      sortDir,
      statusFilter,
      perPage,
    }
    localStorage.setItem("cm_prefs", JSON.stringify(nextPrefs))
  }, [type, search, sortBy, sortDir, statusFilter, perPage])

  // Memoize loadData to satisfy react-hooks/exhaustive-deps and avoid effect churn
  const loadData = useCallback(
    async (t: CategoryType) => {
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
    },
    [toast]
  )

  useEffect(() => {
    loadData(type)
  }, [type, loadData])

  useHotkeys("shift+n", (e) => {
    e.preventDefault()
    setShowCreate(true)
  })

  useHotkeys("/", (e) => {
    e.preventDefault()
    searchRef.current?.focus()
  })

  useHotkeys("shift+i", (e) => {
    e.preventDefault()
    fileInputRef.current?.click()
  })

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

  const duplicateCategory = async (cat: Category) => {
    try {
      const { id, postCount, ...rest } = cat
      void id
      void postCount
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...rest,
          name: `${cat.name} Copy`,
          slug: `${cat.slug}-copy`,
          type: type.toLowerCase(),
        }),
      })
      if (res.ok) {
        toast("Category duplicated")
        await loadData(type)
      } else {
        const d = await res.json()
        toast(d.error || "Failed to duplicate")
      }
    } catch {
      toast("Failed to duplicate")
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

  const exportCategories = () => {
    const source =
      selected.size > 0
        ? categories.filter((c) => selected.has(c.id))
        : sorted
    const data = source.map((c) => ({ ...c }))
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type.toLowerCase()}-categories.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCategoriesCSV = () => {
    const source =
      selected.size > 0
        ? categories.filter((c) => selected.has(c.id))
        : sorted
    const headers = [
      "Name",
      "Slug",
      "Description",
      "Color",
      "Icon",
      "Status",
      "Posts",
    ]
    const rows = source.map((c) => [
      c.name,
      c.slug,
      c.description ?? "",
      c.color ?? "",
      c.icon ?? "",
      c.isActive ? "active" : "inactive",
      String(c.postCount ?? 0),
    ])
    const csv =
      headers.join(",") +
      "\n" +
      rows
        .map((r) =>
          r
            .map((v) => `"${(v ?? "").replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type.toLowerCase()}-categories.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useHotkeys(
    "shift+e",
    (e) => {
      e.preventDefault()
      exportCategories()
    },
    {},
    [sorted, selected, categories]
  )

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImporting(true)
      const text = await file.text()
      const data = file.name.toLowerCase().endsWith(".csv")
        ? parseCSV(text)
        : JSON.parse(text)
      if (!Array.isArray(data)) throw new Error("Invalid format")
      await Promise.all(
        data.map((cat: Partial<Category>) =>
          fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ ...cat, type: type.toLowerCase() }),
          })
        )
      )
      toast("Categories imported")
      await loadData(type)
    } catch {
      toast("Import failed")
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const resetFilters = () => {
    setSearch("")
    setSortBy("order")
    setSortDir("asc")
    setStatusFilter("all")
    setPerPage(10)
  }

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.description?.toLowerCase().includes(term) ?? false)
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? c.isActive
            : !c.isActive
      return matchesSearch && matchesStatus
    })
  }, [categories, debouncedSearch, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "name")
        return sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      if (sortBy === "slug")
        return sortDir === "asc"
          ? a.slug.localeCompare(b.slug)
          : b.slug.localeCompare(a.slug)
      if (sortBy === "posts")
        return sortDir === "asc"
          ? (a.postCount ?? 0) - (b.postCount ?? 0)
          : (b.postCount ?? 0) - (a.postCount ?? 0)
      if (sortBy === "status")
        return sortDir === "asc"
          ? Number(a.isActive) - Number(b.isActive)
          : Number(b.isActive) - Number(a.isActive)
      return sortDir === "asc"
        ? (a.order ?? 0) - (b.order ?? 0)
        : (b.order ?? 0) - (a.order ?? 0)
    })
  }, [filtered, sortBy, sortDir])

  const paginated = useMemo(() => {
    return sorted.slice((currentPage - 1) * perPage, currentPage * perPage)
  }, [sorted, currentPage, perPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, sortDir, type, statusFilter, perPage])

  const activeCount = useMemo(
    () => categories.filter((c) => c.isActive).length,
    [categories]
  )
  const inactiveCount = categories.length - activeCount

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", selected.size > 0 && "pb-20 sm:pb-4")}>
      <AdminPageHeader
        title="Categories"
        subtitle="Manage your blog and video categories"
      />
      <div className="grid w-full max-w-xs grid-cols-3 gap-2 text-center sm:max-w-none sm:w-auto">
        <div className="rounded-md bg-gray-50 p-2">
          <div className="text-lg font-bold">{categories.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <div className="text-lg font-bold">{activeCount}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <div className="text-lg font-bold">{inactiveCount}</div>
          <div className="text-xs text-gray-500">Inactive</div>
        </div>
      </div>
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
          <div className="relative w-full sm:w-40">
            <Input
              ref={searchRef}
              aria-label="Search categories"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearch("")
              }}
              className="pr-8"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Sort By">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="slug">Slug</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
              <SelectTrigger className="w-full sm:w-28" aria-label="Sort Direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}
            >
            <SelectTrigger className="w-full sm:w-32" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(perPage)}
            onValueChange={(v) => setPerPage(Number(v))}
          >
            <SelectTrigger className="w-full sm:w-28" aria-label="Per Page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={exportCategoriesCSV}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportCategories}>
            Export JSON
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            New Category
          </Button>
        </div>
      </div>
      <CategoryBulkActions
          count={selected.size}
          onPublish={() => bulkEnable(Array.from(selected))}
          onUnpublish={() => bulkDisable(Array.from(selected))}
          onDelete={() => bulkDelete(Array.from(selected))}
          onClear={() => setSelected(new Set())}
        />
        <CategoryList
          categories={paginated}
          type={type}
          onEdit={(cat) => setEditing(cat)}
          onDelete={openDeleteDialog}
          onToggleStatus={toggleStatus}
          onDuplicate={duplicateCategory}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      <Pagination
        currentPage={currentPage}
        totalCount={filtered.length}
        perPage={perPage}
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
