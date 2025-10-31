// app/admin/dashboard/page.tsx
import { AdminDashboardSectionPage } from "./AdminDashboardSectionPage";
import type { SectionId } from "./sections";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { isAdminSdkAvailable, ADMIN_BYPASS } from "@/lib/firebase-admin";
import { isCiLike } from "@/lib/env/is-ci-like";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// === SEO METADATA (ADMIN - NOINDEX) ===
export const metadata = getMetadata({
  title: `${SITE_NAME} Admin Dashboard`,
  description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
  path: "/admin/dashboard",
  robots: "noindex, nofollow",
  openGraph: {
    title: `${SITE_NAME} Admin Dashboard`,
    description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
    url: `${SITE_URL}/admin/dashboard`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Cover Image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} Admin Dashboard`,
    description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // No schema for admin/noindex pages
});

function resolveRequestOrigin(headerList: {
  get(name: string): string | null;
}): string {
  const forwardedProto =
    headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? null;
  const forwardedHost =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ?? null;
  const host = forwardedHost ?? headerList.get("host");

  if (host) {
    const proto =
      forwardedProto ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL ?? SITE_URL;
}

async function prefetchDashboard(
  qc: QueryClient,
  cookie: string,
  origin: string,
) {
  // Forward cookies for admin-only API
  // Prefer absolute URL to ensure cookies are sent in all envs
  const url = `${origin}/api/admin/stats?range=12mo`;

  await qc.prefetchQuery({
    queryKey: ["dashboard", "12mo"],
    queryFn: async () => {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { cookie },
      });
      if (res.status === 304) {
        // Prefetch won’t have cache yet; treat as error to fall back to client fetch
        throw new Error("Not Modified");
      }
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });
}

// lightweight E2E helper: in CI/e2e we also try to warm the blog dashboard data,
// but we never hard-fail the page if this is missing.
async function prefetchDashboardBlog(
  qc: QueryClient,
  cookie: string,
  origin: string,
) {
  // important: admin should see drafts too
  const url = `${origin}/api/admin/blogs?all=1&limit=20`;
  await qc.prefetchQuery({
    queryKey: ["dashboard-blog", "admin"],
    queryFn: async () => {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { cookie },
      });
      if (!res.ok) throw new Error("Failed to load blog data");
      return res.json();
    },
    staleTime: 0,
  });
}

const SECTION: SectionId = "overview";

export default async function AdminDashboardPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const origin = resolveRequestOrigin(h);
  const ciLike = isCiLike();

  const reqHeaders = new Headers();
  for (const [key, value] of h.entries()) {
    reqHeaders.append(key, value);
  }
  if (cookie) {
    reqHeaders.set("cookie", cookie);
  } else {
    reqHeaders.delete("cookie");
  }

  const req = new NextRequest(new URL("/admin/dashboard", origin), {
    headers: reqHeaders,
  });

  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const queryClient = new QueryClient();

  // unified guard for SSR prefetch
  const disableServerPrefetch =
    ciLike ||
    process.env.E2E === "true" ||
    process.env.TEST_MODE === "true" ||
    process.env.ADMIN_DISABLE_SSR_PREFETCH === "true";

  let shouldServerPrefetch =
    !disableServerPrefetch && isAdminSdkAvailable() && !ADMIN_BYPASS;

  // React 19 dev double-render guard — run prefetch only once on the server
  if (shouldServerPrefetch && process.env.NODE_ENV !== "production") {
    const g = globalThis as { __ADMIN_PREFETCH_SKIP_ONCE__?: boolean };
    if (g.__ADMIN_PREFETCH_SKIP_ONCE__) {
      g.__ADMIN_PREFETCH_SKIP_ONCE__ = false;
      shouldServerPrefetch = false;
    } else {
      g.__ADMIN_PREFETCH_SKIP_ONCE__ = true;
    }
  }

  if (shouldServerPrefetch) {
    try {
      await prefetchDashboard(queryClient, cookie, origin);
    } catch {
      // noop: keeps page resilient when API or auth is unavailable on the server
    }

    // extra hydration for e2e/blog tests — ignore errors completely
    try {
      await prefetchDashboardBlog(queryClient, cookie, origin);
    } catch {
      // still noop
    }
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div data-testid="admin-dashboard-root">
        {ciLike ? (
          <div data-testid="admin-dashboard-e2e-env" className="sr-only">
            admin-dashboard-e2e
          </div>
        ) : null}
        <AdminDashboardSectionPage section={SECTION} />
      </div>
    </HydrationBoundary>
  );
}
