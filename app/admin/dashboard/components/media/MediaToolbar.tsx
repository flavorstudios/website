"use client";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function MediaToolbar() {
  return (
    <div className="flex items-center justify-between mb-4">
      <AdminPageHeader
        title="Media Library"
        subtitle="Manage and organize your uploaded media files"
      />
    </div>
  );
}
