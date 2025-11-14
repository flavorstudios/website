import type { BlogPost } from "@/lib/content-store";
import { fetchJson } from "@/lib/http";
import { clampPageSize, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export interface AdminBlogQueryParams {
  q?: string;
  author?: string;
  status?: string;
  category?: string;
  tag?: string;
  sort?: string;
  sortDir?: "asc" | "desc";
  cursor?: string;
  limit?: number;
  includeAll?: boolean;
}

export interface AdminBlogListResponse {
  items: BlogPost[];
  nextCursor?: string;
  total?: number;
}

function appendIfDefined(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value && value.trim().length > 0) {
    params.set(key, value);
  }
}

export async function fetchAdminBlogPosts(
  query: AdminBlogQueryParams,
): Promise<AdminBlogListResponse> {
  const params = new URLSearchParams();
  const {
    q,
    author,
    status,
    category,
    tag,
    sort,
    sortDir,
    cursor,
    limit,
    includeAll,
  } = query;

  appendIfDefined(params, "q", q);
  appendIfDefined(params, "author", author);
  appendIfDefined(params, "status", status);
  appendIfDefined(params, "category", category);
  appendIfDefined(params, "tag", tag);
  appendIfDefined(params, "sort", sort);
  appendIfDefined(params, "sortDir", sortDir);

  if (cursor) {
    params.set("cursor", cursor);
  }

  if (includeAll) {
    params.set("all", "1");
  } else {
    const clampedLimit = clampPageSize(
      limit ?? DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
    );
    params.set("limit", String(clampedLimit));
  }

  const url = `/api/admin/blogs?${params.toString()}`;
  return fetchJson<AdminBlogListResponse>(url, { cache: "no-store" });
}