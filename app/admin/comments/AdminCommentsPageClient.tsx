"use client";

import AdminAuthGuard from "@/components/AdminAuthGuard";
import CommentManager from "@/app/admin/dashboard/components/comment-manager";

export default function AdminCommentsPageClient() {
  return (
    <AdminAuthGuard>
      <div className="p-4 md:p-8">
        <CommentManager />
      </div>
    </AdminAuthGuard>
  );
}