// app/watch/category/[slug]/page.tsx

import siteData from "@/content-data/categories.json";
import WatchPage from "../../page";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function WatchCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const categorySlug = params.slug;

  // Look up the video category in JSON, not the DB!
  const category = (siteData.CATEGORIES.watch || []).find(
    (cat) => cat.slug === categorySlug
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  // Still fetch videos from Prisma as before
  const videos = await prisma.video.findMany({
    where: {
      category: { slug: categorySlug },
    },
    orderBy: { createdAt: "desc" },
    skip: searchParams.page ? (parseInt(searchParams.page) - 1) * 10 : 0,
    take: 10,
  });

  return (
    <WatchPage
      searchParams={{ ...searchParams, category: categorySlug }}
      category={category}
      videos={videos}
    />
  );
}
