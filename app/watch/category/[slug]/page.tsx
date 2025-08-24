import siteData from "@/content-data/categories.json";
import WatchPage from "../../page";
import { SITE_URL } from "@/lib/constants";

// --- Add this if VideoType isn't already imported ---
// You can instead: import { VideoType } from "@/lib/types" if you have it there
type VideoType = {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtubeId?: string;
  thumbnail?: string;
  duration: string;
  category: string;
  categories?: string[];
  tags?: string[];
  publishedAt: string;
  views: number;
  featured: boolean;
  status: string;
};

export default async function WatchCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = slug;

  // Look up the video category in JSON, not the DB!
  const category = (siteData.CATEGORIES.watch || []).find(
    (cat) => cat.slug === categorySlug
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  // Fetch videos from the public API and filter by category slug
  const videos = await (async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
      const res = await fetch(`${baseUrl}/api/videos`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      const allVideos: VideoType[] = Array.isArray(data) ? data : data.videos || [];

      const normalizeSlug = (name: string) =>
        name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      return allVideos.filter((video: VideoType) => {
        const cats =
          Array.isArray(video.categories) && video.categories.length > 0
            ? video.categories
            : [video.category];
        return cats.some((cat: string) => normalizeSlug(cat) === categorySlug);
      });
    } catch (error) {
      console.error("Failed to fetch videos for category:", error);
      return [];
    }
  })();

  return (
    <WatchPage
      searchParams={{ ...resolvedSearchParams, category: categorySlug }}
      category={category}
      videos={videos}
    />
  );
}
