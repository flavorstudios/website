import siteData from "@/content-data/categories.json" assert { type: "json" };
import WatchPage from "../../page";
import type { PageProps } from "@/types/next";

type WatchCategoryPageProps = PageProps<{ slug: string }, { page?: string }>;

export default async function WatchCategoryPage({
  params,
  searchParams,
}: WatchCategoryPageProps) {
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

  return (
    <WatchPage
      searchParams={{
        category: categorySlug,
        page: resolvedSearchParams.page,
      }}
    />
  );
}
