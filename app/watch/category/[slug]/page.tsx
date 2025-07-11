// app/watch/category/[slug]/page.tsx

import WatchPage from "../../page"

export default function WatchCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  return <WatchPage searchParams={{ ...searchParams, category: params.slug }} />
}
