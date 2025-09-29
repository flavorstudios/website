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

function resolveRequestOrigin(headerList: { get(name: string): string | null }): string {
  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? null;
  const forwardedHost = headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ?? null;
  const host = forwardedHost ?? headerList.get("host");

  if (host) {
    const proto = forwardedProto ??
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
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const origin = resolveRequestOrigin(h);
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

  // Don’t block rendering if SSR fetch fails—client will recover
  try {
    await prefetchDashboard(queryClient, cookie, origin);
  } catch {
    // noop: keeps page resilient when API or auth is unavailable on the server
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardPageClient />
    </HydrationBoundary>
  );
}
