import siteData from "@/content-data/categories.json";
import WatchPage from "../../page";

export default async function WatchCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const resolvedSearchParams = searchParams;
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
      searchParams={{ ...resolvedSearchParams, category: categorySlug }}
    />
  );
}
