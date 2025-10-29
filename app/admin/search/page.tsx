import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { SITE_URL, SITE_NAME, SITE_BRAND_TWITTER } from "@/lib/constants";
import { getMetadata } from "@/lib/seo-utils";
import { PageHeader } from "@/components/admin/page-header";
import AdminSearchPageClient from "./AdminSearchPageClient";
import type { SearchParams } from "@/types/next";

interface PageProps {
  searchParams?: SearchParams<{ q?: string }>;
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const metadata = getMetadata({
  title: `${SITE_NAME} Admin Search`,
  description: `Search posts, videos, users, and categories across the ${SITE_NAME} admin tools.`,
  path: "/admin/search",
  robots: "noindex, nofollow",
  openGraph: {
    title: `${SITE_NAME} Admin Search`,
    description: `Search posts, videos, users, and categories across the ${SITE_NAME} admin tools.`,
    url: `${SITE_URL}/admin/search`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} Admin Search`,
    description: `Search posts, videos, users, and categories across the ${SITE_NAME} admin tools.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export default async function AdminSearchPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = typeof params?.q === "string" ? params.q : "";

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const req = new NextRequest(`${SITE_URL}/admin/search`, {
    headers: { cookie },
  });

  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHeader
        title="Admin Search"
        description="Search posts, videos, users, categories, and tags across the admin."
        className="sr-only"
        headingClassName="sr-only"
        descriptionClassName="sr-only"
      />
      <AdminSearchPageClient initialQuery={query} />
    </>
  );
}