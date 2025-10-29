import siteData from "@/content-data/categories.json" assert { type: "json" };
import WatchPage from "../../page";
import type { SearchParams } from "@/types/next";

export default async function WatchCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: SearchParams<{ page?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
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
      searchParams={Promise.resolve({
        category: categorySlug,
        page: resolvedSearchParams.page,
      })}
    />
  );
}
