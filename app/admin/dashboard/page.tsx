import AdminDashboardPageClient from "./AdminDashboardPageClient";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";

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

async function prefetchDashboard(qc: QueryClient, cookie: string) {
  // Forward cookies for admin-only API
  // Prefer absolute URL to ensure cookies are sent in all envs
  const url = `${SITE_URL}/api/admin/stats?range=12mo`;

  await qc.prefetchQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { cookie },
        // Next.js runtime fetch; credentials are implied via forwarded cookie header
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

export default async function AdminDashboardPage() {
  const h = headers();
  const cookie = h.get("cookie") ?? "";
  const req = new NextRequest(`${SITE_URL}/admin/dashboard`, {
    headers: { cookie },
  });
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const queryClient = new QueryClient();

  // Don’t block rendering if SSR fetch fails—client will recover
  try {
    await prefetchDashboard(queryClient, cookie);
  } catch {
    // noop: keeps page resilient when API or auth is unavailable on the server
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardPageClient />
    </HydrationBoundary>
  );
}
