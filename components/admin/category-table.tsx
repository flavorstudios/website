// components/admin/category-table.tsx
"use client";

import { Category } from "@/types/category";

type Props = {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
};

export function CategoryTable({ categories, onEdit, onDelete }: Props) {
  return (
    <table className="w-full border mt-6">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-3 text-left">Title</th>
          <th className="py-2 px-3 text-left">Menu Description</th>
          <th className="py-2 px-3 text-left">Slug</th>
          <th className="py-2 px-3 text-left">Type</th>
          <th className="py-2 px-3 text-left">Post Count</th>
          <th className="py-2 px-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {categories.map(cat => (
          <tr key={cat.id} className="border-t">
            <td className="py-2 px-3">{cat.title}</td>
            <td className="py-2 px-3 text-gray-600 text-sm">
              {cat.menuDescription || <span className="italic text-gray-400">—</span>}
            </td>
            <td className="py-2 px-3">{cat.slug}</td>
            <td className="py-2 px-3 capitalize">{cat.type}</td>
            <td className="py-2 px-3">{cat.postCount ?? 0}</td>
            <td className="py-2 px-3 space-x-2">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                onClick={() => onEdit(cat)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                onClick={() => onDelete(cat.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {categories.length === 0 && (
          <tr>
            <td colSpan={6} className="py-6 text-center text-gray-500">
              No categories found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}