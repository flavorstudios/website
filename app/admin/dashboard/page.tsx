import { PageHeader } from "@/components/admin/page-header";
import { AdminDashboardSectionPage, getSectionCopy } from "./AdminDashboardSectionPage";
import type { SectionId } from "./sections";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { isAdminSdkAvailable, ADMIN_BYPASS } from "@/lib/firebase-admin";

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

function resolveRequestOrigin(headerList: { get(name: string): string | null }): string {
  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? null;
  const forwardedHost = headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ?? null;
  const host = forwardedHost ?? headerList.get("host");

  if (host) {
    const proto =
      forwardedProto ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL ?? SITE_URL;
}

async function prefetchDashboard(qc: QueryClient, cookie: string, origin: string) {
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
async function prefetchDashboardBlog(qc: QueryClient, cookie: string, origin: string) {
  const url = `${origin}/api/admin/blog?limit=20`;
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
  });
}

const SECTION: SectionId = "overview";

export default async function AdminDashboardPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const origin = resolveRequestOrigin(h);

  const isTestLikeEnv =
    process.env.NODE_ENV === "test" ||
    process.env.CI === "true" ||
    process.env.E2E === "true" ||
    process.env.TEST_MODE === "true";

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

  // In normal runtime: only prefetch when Admin SDK is available
  // In CI/test/e2e: force prefetch so e2e tests that stub this call can see it
  const canServerPrefetch =
    (isAdminSdkAvailable() && !ADMIN_BYPASS) || isTestLikeEnv;

  if (canServerPrefetch) {
    try {
      await prefetchDashboard(queryClient, cookie, origin);
    } catch {
      // noop: keeps page resilient when API or auth is unavailable on the server
    }

    // extra hydration for e2e/blog tests — ignore errors completely
    if (isTestLikeEnv) {
      try {
        await prefetchDashboardBlog(queryClient, cookie, origin);
      } catch {
        // still noop
      }
    }
  }

  const { title, description } = getSectionCopy(SECTION);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div data-testid="admin-dashboard-root">
        {isTestLikeEnv ? (
          <div data-testid="admin-dashboard-e2e-env" className="sr-only">
            admin-dashboard-e2e
          </div>
        ) : null}
        <PageHeader
          level={1}
          title={title}
          description={description}
          className="sr-only"
          headingClassName="sr-only"
          descriptionClassName={description ? "sr-only" : undefined}
        />
        <AdminDashboardSectionPage section={SECTION} />
      </div>
    </HydrationBoundary>
  );
}
