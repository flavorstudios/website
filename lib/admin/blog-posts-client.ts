import type { BlogPost } from "@/lib/content-store";
import { fetchJson } from "@/lib/http";
import { clampPageSize, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import {
  filterAndPaginateAdminBlogs,
  getAdminBlogFixtures,
  parseAdminBlogQuery,
} from "@/lib/admin/blog-fixtures";
import { isClientE2EEnabled } from "@/lib/e2e-utils";

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

function buildQueryString(query: AdminBlogQueryParams): string {
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

  return params.toString();
}

function buildFixtureResponse(queryString: string): AdminBlogListResponse {
  const { filters } = parseAdminBlogQuery(new URLSearchParams(queryString));
  return filterAndPaginateAdminBlogs(getAdminBlogFixtures(), filters);
}

export async function fetchAdminBlogPosts(
  query: AdminBlogQueryParams,
): Promise<AdminBlogListResponse> {
  const queryString = buildQueryString(query);
  const url = `/api/admin/blogs?${queryString}`;

  try {
    return await fetchJson<AdminBlogListResponse>(url, { cache: "no-store" });
  } catch (error) {
    if (isClientE2EEnabled()) {
      console.warn(
        "[admin-blog] Falling back to deterministic fixtures due to fetch error",
        error,
      );
      return buildFixtureResponse(queryString);
    }
    throw error;
  }
}