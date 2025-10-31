import { AdminDashboardSectionPage } from "../AdminDashboardSectionPage";
import type { SectionId } from "../sections";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { Suspense } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = getMetadata({
  title: `Blog Manager – ${SITE_NAME} Admin`,
  description: `Manage your blog posts, drafts, and editorial calendar for ${SITE_NAME}.`,
  path: "/admin/dashboard/blog",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Blog Manager – ${SITE_NAME} Admin`,
    description: `Manage your blog posts, drafts, and editorial calendar for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/dashboard/blog`,
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
    title: `Blog Manager – ${SITE_NAME} Admin`,
    description: `Manage your blog posts, drafts, and editorial calendar for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

const SECTION: SectionId = "blogs";

/**
 * Small async “gate” that suspends rendering briefly in E2E mode so
 * Suspense fallback (skeletons) is guaranteed to show up first.
 */
async function E2EGate({
  children,
  enabled,
  delayMs = 1200,
}: {
  children: React.ReactNode;
  enabled: boolean;
  delayMs?: number;
}) {
  if (enabled) {
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return <>{children}</>;
}

/** Lightweight skeletons the tests can assert against */
function BlogFallback() {
  return (
    <div
      data-testid="blog-fallback"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          data-testid="blog-card-skeleton"
          className="rounded-xl border border-border p-4"
        >
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted mb-3" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted mb-4" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/** Helper: is E2E slow-mode requested? */
function isE2ESlow(searchParams?: {
  [key: string]: string | string[] | undefined;
}) {
  // Enabled if NEXT_PUBLIC_E2E=1/true OR query ?e2e_slow=1
  const envOn =
    process.env.NEXT_PUBLIC_E2E === "1" ||
    process.env.NEXT_PUBLIC_E2E === "true";
  const q = searchParams?.e2e_slow;
  const qOn = Array.isArray(q) ? q.includes("1") : q === "1";
  return envOn || qOn;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const slow = isE2ESlow(resolvedSearchParams);
  return (
    <>
      <Suspense fallback={<BlogFallback />}>
        <E2EGate enabled={slow}>
          <AdminDashboardSectionPage section={SECTION} />
        </E2EGate>
      </Suspense>
    </>
  );
}
