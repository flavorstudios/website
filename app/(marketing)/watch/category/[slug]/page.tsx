import siteData from "@/content-data/categories.json" assert { type: "json" };
import WatchPage from "../../page";
import { unwrapPageProps, wrapPageProps } from "@/types/next";
import type { PageProps } from "@/types/next";

type WatchCategoryPageProps = PageProps<{ slug: string }, { page?: string }>;

export default async function WatchCategoryPage(props: WatchCategoryPageProps) {
  const { params, searchParams } = await unwrapPageProps(props);
  const { slug } = params;
  const resolvedSearchParams = searchParams ?? {};
  const categorySlug = slug;

  // Look up the video category in JSON, not the DB!
  const category = (siteData.CATEGORIES.watch || []).find(
    (cat) => cat.slug === categorySlug
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  return WatchPage(
    wrapPageProps({
      params: {},
      searchParams: {
        category: categorySlug,
        page: resolvedSearchParams.page,
      },
    }),
  );
}
