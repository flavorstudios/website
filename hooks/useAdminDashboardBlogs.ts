"use client";

import { useQuery } from "@tanstack/react-query";
import { HttpError } from "@/lib/http";
import type { BlogPost } from "@/lib/content-store";

interface AdminBlogResponse {
  items: BlogPost[];
  total?: number;
  nextCursor?: string;
}

export function useAdminDashboardBlogs(enabled = true) {
  return useQuery<AdminBlogResponse>({
    queryKey: ["dashboard-blog", "admin"],
    queryFn: async () => {
      const url = "/api/admin/blogs?all=1&status=all";
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await res.json().catch(() => null)) as
        | (AdminBlogResponse & { error?: string })
        | null;

      if (!res.ok) {
        const message = payload?.error ?? "Failed to fetch blog posts";
        throw new HttpError(message, res.status, url);
      }
      return payload ?? { items: [] };
    },
    staleTime: 0,
    gcTime: 60_000,
    retry: false,
    enabled,
  });
}