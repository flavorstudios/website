"use client";

import { useId } from "react";

import AdminAuthGuard from "@/components/AdminAuthGuard";
import CommentManager from "@/app/admin/dashboard/components/comment-manager";
import { PageHeader } from "@/components/admin/page-header";

export default function AdminCommentsPageClient() {
  const headingId = useId();
  return (
    <AdminAuthGuard>
      <div className="p-4 md:p-8">
        <section
          aria-labelledby={headingId}
          className="mx-auto flex max-w-6xl flex-col gap-6"
        >
          <PageHeader
            headingId={headingId}
            title="Comments"
            description="Moderate community feedback and keep discussions on track."
            level={1}
          />
          <CommentManager />
        </section>
      </div>
    </AdminAuthGuard>
  );
}