// components/admin/category-form.tsx
"use client";

import { useState } from "react";
import { Category } from "@/types/category";

type Props = {
  initialData?: Partial<Category>;
  onSubmit: (data: Partial<Category>) => void;
  isLoading?: boolean;
  error?: string;
};

export function CategoryForm({ initialData = {}, onSubmit, isLoading, error }: Props) {
  const [form, setForm] = useState<Partial<Category>>(initialData);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          className="border rounded p-2 w-full"
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Slug</label>
        <input
          className="border rounded p-2 w-full"
          name="slug"
          value={form.slug || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Type</label>
        <select
          className="border rounded p-2 w-full"
          name="type"
          value={form.type || "blog"}
          onChange={handleChange}
          required
        >
          <option value="blog">Blog</option>
          <option value="video">Watch</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Short Description (Menu Tooltip)</label>
        <input
          className="border rounded p-2 w-full"
          name="menuDescription"
          value={form.menuDescription || ""}
          onChange={handleChange}
          placeholder="Eg: Latest news, guides, reviews, etc."
        />
        <span className="text-xs text-gray-500">
          Shows as tooltip in menu and for accessibility. Keep it short!
        </span>
      </div>
      <div>
        <label className="block font-medium mb-1">Long Description</label>
        <textarea
          className="border rounded p-2 w-full"
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          rows={3}
          placeholder="Full description for category pages or SEO"
        />
      </div>
      {/* Add more fields as needed! */}

      {error && (
        <div className="bg-red-100 text-red-700 px-2 py-1 rounded">{error}</div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}