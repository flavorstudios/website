"use client";

import AdminAuthGuard from "@/components/AdminAuthGuard";
import { BlogEditor, type BlogPost } from "../../dashboard/components/blog-editor";

export default function BlogEditorPageClient({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminAuthGuard>
          <BlogEditor initialPost={post} />
        </AdminAuthGuard>
      </div>
    </div>
  );
}
