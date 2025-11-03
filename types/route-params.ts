import { wrapPageProps } from "./next";
import type { PageProps } from "./next";

export type BlogPageContext = PageProps<{ slug: string }>;
export type BlogParams = Awaited<BlogPageContext["params"]>;

export type PreviewPageContext = PageProps<
  { id: string },
  { token?: string }
>;
export type PreviewParams = Awaited<PreviewPageContext["params"]>;
export type PreviewSearchParams = Awaited<
  NonNullable<PreviewPageContext["searchParams"]>
>;

export function createBlogPageProps(params: BlogParams): BlogPageContext {
  return wrapPageProps({ params }) as BlogPageContext;
}

export function createPreviewPageProps(
  params: PreviewParams,
  searchParams?: PreviewSearchParams,
): PreviewPageContext {
  return wrapPageProps({ params, searchParams }) as PreviewPageContext;
}