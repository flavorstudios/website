// app/watch/category/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo-utils";
import { videoStore } from "@/lib/content-store";
import { categoryStore } from "@/lib/category-store";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }) {
  const category = await categoryStore.getBySlug(params.slug, "video");
  if (!category) return { title: "Category Not Found – Flavor Studios" };

  return {
    ...category.meta,
    title: `${category.title} – Flavor Studios`,
    description: category.meta.description,
    alternates: { canonical: category.meta.canonicalUrl },
    openGraph: category.openGraph,
    twitter: category.twitter,
    robots: category.meta.robots,
    // You can also add schema here if you want!
  };
}

export default async function WatchCategoryPage({ params }) {
  const category = await categoryStore.getBySlug(params.slug, "video");
  if (!category) notFound();

  // Replace this with your own method if needed
  const videos = await videoStore.getPublishedByCategory(category.name);

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2">
        {category.title}
      </h1>
      <p className="mb-6 text-lg text-gray-600">{category.meta.description}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        <Badge style={{ background: category.color, color: "#333" }}>
          {category.title}
        </Badge>
      </div>

      {videos.length === 0 ? (
        <div className="text-gray-500">No videos found in this category.</div>
      ) : (
        <ul className="space-y-8">
          {videos.map((video) => (
            <li key={video.slug}>
              <Link href={`/watch/${video.slug}`}>
                <a className="block group">
                  <h2 className="text-2xl font-semibold group-hover:underline">{video.title}</h2>
                  <p className="text-gray-500">{video.description}</p>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}