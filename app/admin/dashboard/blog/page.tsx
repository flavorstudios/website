import { Suspense } from "react";

import { BlogCardSkeleton } from "@/components/BlogCardSkeleton";
import { PageHeader } from "@/components/admin/page-header";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { getMetadata } from "@/lib/seo-utils";

import { AdminDashboardSectionPage } from "../AdminDashboardSectionPage";
import { SECTION_DESCRIPTIONS, SECTION_HEADINGS } from "../section-metadata";
import type { SectionId } from "../sections";

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
        <BlogCardSkeleton key={i} data-testid="blog-card" aria-hidden="true" />
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
