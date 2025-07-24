import { notFound } from "next/navigation";
import { blogStore } from "@/lib/content-store";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import BlogEditorPageClient from "./BlogEditorPageClient";

interface PageProps {
  searchParams: { id?: string; slug?: string };
}

export const metadata = getMetadata({
  title: `Edit Blog Post – Admin Panel | ${SITE_NAME}`,
  description: `Edit and publish blog posts for ${SITE_NAME}.`,
  path: "/admin/blog/edit",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Edit Blog Post – Admin Panel | ${SITE_NAME}`,
    description: `Edit and publish blog posts for ${SITE_NAME}.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Cover image for ${SITE_NAME} Admin Panel`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Edit Blog Post – Admin Panel | ${SITE_NAME}`,
    description: `Edit and publish blog posts for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export default async function BlogEditPage({ searchParams }: PageProps) {
  const { id, slug } = searchParams;
  let post = null;
  if (id) {
    post = await blogStore.getById(id);
  } else if (slug) {
    post = await blogStore.getBySlug(slug);
  }
  if (!post) notFound();

  return <BlogEditorPageClient post={post} />;
}
