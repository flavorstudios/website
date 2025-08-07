"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import BlogStatusBadge from "./BlogStatusBadge";
import BlogRowActions from "./BlogRowActions";
import type { BlogPost } from "@/lib/content-store";
import Image from "next/image";
import { formatDate } from "@/lib/date";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtualizedTable } from "../table";

export interface BlogTableProps {
  posts: BlogPost[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (checked: boolean) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
}

export default function BlogTable({
  posts,
  selected,
  toggleSelect,
  toggleSelectAll,
  onDelete,
  onTogglePublish,
}: BlogTableProps) {
  const allSelected = posts.length > 0 && posts.every((p) => selected.has(p.id));

  // ColumnDefs for TanStack Table
  const columns = useMemo<ColumnDef<BlogPost>[]>(() => [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(v) => toggleSelectAll(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={() => toggleSelect(row.original.id)}
          aria-label={`Select blog post: ${row.original.title}`}
        />
      ),
      size: 32,
    },
    {
      accessorKey: "title",
      header: () => <span className="max-w-[12rem] truncate">Title</span>,
      cell: ({ row }) => (
        <a
          href={`/admin/blog/edit?id=${row.original.id}`}
          className="text-blue-600 hover:underline font-medium max-w-[12rem] truncate"
          aria-label={`Edit blog post: ${row.original.title}`}
        >
          {row.original.title}
        </a>
      ),
      meta: {
        headerClassName: "max-w-[12rem] truncate",
        cellClassName: "max-w-[12rem] truncate",
      },
    },
    {
      id: "seo",
      header: () => <span className="hidden md:inline">SEO</span>,
      cell: ({ row }) => {
        const seoTitle = row.original.seoTitle;
        let cls = "text-green-600";
        let title: string | undefined = "SEO title length is optimal";
        if (!seoTitle || seoTitle.length === 0) {
          cls = "text-gray-500";
          title = "Missing SEO title";
        } else if (seoTitle.length < 50) {
          cls = "text-yellow-600";
          title = "SEO title is too short";
        } else if (seoTitle.length > 60) {
          cls = "text-red-600";
          title = "SEO title is too long";
        }
        return (
          <span title={title} className={cls}>
            {seoTitle?.length ?? 0}
          </span>
        );
      },
      meta: {
        headerClassName: "hidden md:table-cell",
        cellClassName: "hidden md:table-cell",
      },
    },
    {
      accessorKey: "author",
      header: () => "Author",
      cell: ({ row }) => row.original.author,
    },
    {
      id: "image",
      header: () => <span className="hidden md:inline">Image</span>,
      cell: ({ row }) =>
        row.original.featuredImage ? (
          <Image
            src={row.original.featuredImage}
            alt={`Featured image for ${row.original.title}`}
            width={64}
            height={40}
            className="h-10 w-16 object-cover rounded"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
      meta: {
        headerClassName: "hidden md:table-cell",
        cellClassName: "hidden md:table-cell",
      },
    },
    {
      id: "status",
      header: () => "Status",
      cell: ({ row }) => (
        <BlogStatusBadge status={row.original.status as BlogPost["status"]} />
      ),
    },
    {
      id: "date",
      header: () => <span className="hidden sm:inline">Date</span>,
      cell: ({ row }) => (
        <>{formatDate(row.original.publishedAt || row.original.createdAt)}</>
      ),
      meta: {
        headerClassName: "hidden sm:table-cell",
        cellClassName: "hidden sm:table-cell",
      },
    },
    {
      id: "views",
      header: () => <span className="hidden sm:inline text-right">Views</span>,
      cell: ({ row }) => (
        <>
          {(typeof row.original.views === "number"
            ? row.original.views
            : 0
          ).toLocaleString()}
        </>
      ),
      meta: {
        headerClassName: "hidden sm:table-cell text-right",
        cellClassName: "hidden sm:table-cell text-right",
      },
    },
    {
      id: "comments",
      header: () => <span className="hidden sm:inline text-right">Comments</span>,
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.commentCount ?? 0}</Badge>
      ),
      meta: {
        headerClassName: "hidden sm:table-cell text-right",
        cellClassName: "hidden sm:table-cell text-right",
      },
    },
    {
      id: "tags",
      header: () => <span className="hidden lg:inline">Tags</span>,
      cell: ({ row }) =>
        row.original.tags?.length
          ? row.original.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="mr-1">
                {tag}
              </Badge>
            ))
          : <span className="text-xs text-gray-400">—</span>,
      meta: {
        headerClassName: "hidden lg:table-cell",
        cellClassName: "hidden lg:table-cell",
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right">Actions</span>,
      cell: ({ row }) => (
        <BlogRowActions
          post={row.original}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
        />
      ),
      meta: {
        cellClassName: "text-right",
        headerClassName: "text-right",
      },
    },
  ], [
    allSelected,
    selected,
    toggleSelectAll,
    toggleSelect,
    onDelete,
    onTogglePublish,
  ]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-2"
          aria-hidden="true"
        >
          <rect width="56" height="56" rx="12" fill="#F3F4F6" />
          <path d="M19 29V35C19 35.5523 19.4477 36 20 36H36C36.5523 36 37 35.5523 37 35V29" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
          <rect x="15" y="19" width="26" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2" />
          <circle cx="28" cy="24" r="1.5" fill="#A1A1AA" />
        </svg>
        <span className="text-lg font-medium">No blog posts found</span>
        <span className="text-sm mt-2">Try changing your filters or create a new post.</span>
      </div>
    );
  }

  return (
    <VirtualizedTable<BlogPost>
      data={posts}
      columns={columns}
      rowHeight={80}
      className="overflow-x-auto border rounded-lg max-h-[600px]"
      getRowProps={() => ({
        className:
          "hover:bg-gray-50 focus-visible:bg-blue-50 focus-visible:outline-none",
        tabIndex: 0,
      })}
    />
  );
}
