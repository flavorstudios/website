import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { AdminDashboardSectionPage } from "../AdminDashboardSectionPage";
import { SECTION_DESCRIPTIONS, SECTION_HEADINGS } from "../section-metadata";
import type { SectionId } from "../sections";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

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

const HEADING_ID = "blog-page-title";

/** Lightweight skeletons the tests can assert against */
function BlogFallback({ headingId }: { headingId: string }) {
  return (
    <div
      data-testid="blog-fallback"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
      aria-labelledby={headingId}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <article
          key={i}
          data-testid="blog-card"
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          aria-hidden="true"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="h-12 w-16 flex-shrink-0 animate-pulse rounded bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const title = SECTION_HEADINGS[SECTION];
  const description = SECTION_DESCRIPTIONS[SECTION];

  return (
    <div className="space-y-6">
      <PageHeader
        headingId={HEADING_ID}
        title={title}
        description={description}
        className="mb-2"
        containerClassName="flex-col"
        headingClassName="text-3xl font-semibold tracking-tight text-foreground"
        descriptionClassName="text-sm text-muted-foreground"
        headingProps={{ "data-testid": "page-title" }}
      />
      <Suspense fallback={<BlogFallback headingId={HEADING_ID} />}>
        <AdminDashboardSectionPage
          section={SECTION}
          suppressHeading
          headingId={HEADING_ID}
        />
      </Suspense>
    </div>
  );
}
