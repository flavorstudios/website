"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  type: "blog" | "video"
  description?: string
  color?: string
  icon?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  postCount: number
}

export function CategoryManager() {
  const [blogCategories, setBlogCategories] = useState<Category[]>([])
  const [videoCategories, setVideoCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createType, setCreateType] = useState<"blog" | "video">("blog")

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      const data = await response.json()
      setBlogCategories(data.categories?.filter((cat: Category) => cat.type === "blog") || [])
      setVideoCategories(data.categories?.filter((cat: Category) => cat.type === "video") || [])
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        await loadCategories()
        setShowCreateForm(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create category")
      }
    } catch (error) {
      console.error("Failed to create category:", error)
      alert("Failed to create category")
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        await loadCategories()
        setEditingCategory(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update category")
      }
    } catch (error) {
      console.error("Failed to update category:", error)
      alert("Failed to update category")
    }
  }

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadCategories()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Failed to delete category:", error)
      alert("Failed to delete category")
    }
  }

  const toggleCategoryStatus = async (id: string, isActive: boolean) => {
    await updateCategory(id, { isActive })
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
      <div className="flex justify-between items-center">
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

      {/* Category Tabs */}
      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blog">Blog Categories ({blogCategories.length})</TabsTrigger>
          <TabsTrigger value="video">Video Categories ({videoCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <CategoryList
            categories={blogCategories}
            type="blog"
            onEdit={setEditingCategory}
            onDelete={deleteCategory}
            onToggleStatus={toggleCategoryStatus}
          />
        </TabsContent>

        <TabsContent value="video">
          <CategoryList
            categories={videoCategories}
            type="video"
            onEdit={setEditingCategory}
            onDelete={deleteCategory}
            onToggleStatus={toggleCategoryStatus}
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

function CategoryList({
  categories,
  type,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  categories: Category[]
  type: "blog" | "video"
  onEdit: (category: Category) => void
  onDelete: (id: string, name: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}) {
  return (
    <div className="grid gap-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`hover:shadow-lg transition-shadow ${!category.isActive ? "opacity-60" : ""}`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color || "#6366f1" }} />
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <p className="text-sm text-gray-500">/{category.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{category.postCount} posts</Badge>
                <Switch
                  checked={category.isActive}
                  onCheckedChange={(checked) => onToggleStatus(category.id, checked)}
                />
                <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(category.id, category.name)}
                  className="text-red-600 hover:text-red-700"
                  disabled={category.postCount > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {category.description && (
            <CardContent>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </CardContent>
          )}
        </Card>
      ))}

      {categories.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No {type} categories yet. Create your first category to get started!</p>
        </Card>
      )}
    </div>
  )
}

function CategoryForm({
  category,
  type,
  onSave,
  onCancel,
  onTypeChange,
}: {
  category: Category | null
  type: "blog" | "video"
  onSave: (data: Partial<Category>) => void
  onCancel: () => void
  onTypeChange: (type: "blog" | "video") => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    color: category?.color || "#6366f1",
    type: category?.type || type,
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
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
                onValueChange={(value: "blog" | "video") => {
                  setFormData((prev) => ({ ...prev, type: value }))
                  onTypeChange(value)
                }}
                disabled={!!category}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Category</SelectItem>
                  <SelectItem value="video">Video Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active</label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
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
