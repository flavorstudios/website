// app/admin/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { CategoryTable } from "@/components/admin/category-table";
import { CategoryForm } from "@/components/admin/category-form";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editData, setEditData] = useState<Partial<Category> | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch all categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories([
        ...(data.blogCategories || []),
        ...(data.videoCategories || [])
      ]);
    } catch (err) {
      setError("Failed to load categories.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Add/Edit form submit (now includes menuDescription)
  const handleFormSubmit = async (formData: Partial<Category>) => {
    setFormLoading(true);
    try {
      const url = editData?.id
        ? `/api/admin/categories/${editData.id}`
        : "/api/admin/categories";
      const method = editData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Ensure menuDescription is sent
          menuDescription: formData.menuDescription || "",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({ type: "success", message: editData?.id ? "Category updated!" : "Category created!" });
        setShowForm(false);
        setEditData(null);
        fetchCategories();
      } else {
        throw new Error(data.error || "Failed to save category.");
      }
    } catch (err: any) {
      setToast({ type: "error", message: err.message });
    }
    setFormLoading(false);
  };

  // Edit handler
  const handleEdit = (cat: Category) => {
    setEditData(cat);
    setShowForm(true);
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          setToast({ type: "success", message: "Category deleted!" });
          setCategories(prev => prev.filter(cat => cat.id !== id));
        } else {
          throw new Error(data.error || "Failed to delete.");
        }
      } catch (err: any) {
        setToast({ type: "error", message: err.message });
      }
    }
  };

  // Add handler
  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Toast auto-close
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>
      {toast && (
        <div className={`mb-4 p-2 rounded ${toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {toast.message}
        </div>
      )}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <div>Loading categories…</div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg min-w-[340px] max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              {editData?.id ? "Edit Category" : "Add Category"}
            </h2>
            <CategoryForm
              initialData={editData || {}}
              onSubmit={handleFormSubmit}
              isLoading={formLoading}
              // Now passes menuDescription to the form!
            />
            <button
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowForm(false);
                setEditData(null);
              }}
              disabled={formLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}