import { getMetadata } from "@/lib/seo-utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, Calendar, Youtube, Clock, Video, Star, ArrowRight } from "lucide-react";
import { getDynamicCategories } from "@/lib/dynamic-categories";
import { CategoryTabs } from "@/components/ui/category-tabs";

// === SEO METADATA (REQUIRED FOR NEXT.JS 15+) ===
export const metadata = getMetadata({
  title: "Flavor Studios Videos | Original Anime, Studio Films & More",
  description:
    "Watch original anime, studio films, and exclusive video content from Flavor Studios. Discover our creative world—stream the latest now.",
  path: "/watch",
  canonical: "https://flavorstudios.in/watch",
  robots: "index,follow", // <-- EXPLICITLY SET
  openGraph: {
    title: "Flavor Studios Videos | Original Anime, Studio Films & More",
    description:
      "Watch original anime, studio films, and exclusive video content from Flavor Studios. Discover our creative world—stream the latest now.",
    url: "https://flavorstudios.in/watch",
    type: "website",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
        alt: "Flavor Studios Videos – Original Anime, Studio Films & More",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Flavor Studios Videos | Original Anime, Studio Films & More",
    description:
      "Watch original anime, studio films, and exclusive video content from Flavor Studios. Discover our creative world—stream the latest now.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Flavor Studios Videos",
    description:
      "Watch original anime, studio films, and exclusive video content from Flavor Studios. Discover our creative world—stream the latest now.",
    url: "https://flavorstudios.in/watch",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
    },
  },
});

// --- DATA FETCHING ---
async function getWatchData() {
  try {
    const [videosResponse, { videoCategories }] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/videos`, {
        cache: "no-store",
      }).catch(() => ({ ok: false, json: () => Promise.resolve({ videos: [] }) })),
      getDynamicCategories(),
    ]);

    let videos = [];
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      videos = (videosData.videos || []).filter((video: any) => video.status === "published");
    }

    return { videos, categories: videoCategories };
  } catch (error) {
    console.error("Failed to fetch watch data:", error);
    return { videos: [], categories: [] };
  }
}

// --- MAIN PAGE COMPONENT ---
export default async function WatchPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const { videos, categories } = await getWatchData();
  const selectedCategory = searchParams.category || "all";
  const currentPage = Number.parseInt(searchParams.page || "1");
  const videosPerPage = 12;

  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((video: any) => {
          const categorySlug = video.category
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return categorySlug === selectedCategory || video.category === selectedCategory;
        });

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage);

  const featuredVideos = filteredVideos.filter((video: any) => video.featured).slice(0, 3);
  const regularVideos = paginatedVideos.filter((video: any) => !video.featured);

  // Analytics data
  const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0);
  const totalDuration = videos.reduce((sum: number, video: any) => {
    const duration = video.duration || "0:00";
    const [minutes, seconds] = duration.split(":").map(Number);
    return sum + (minutes || 0) + (seconds || 0) / 60;
  }, 0);
  const avgDuration = videos.length > 0 ? Math.round(totalDuration / videos.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            {/* Blue Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6 text-sm font-medium shadow-lg">
              <Video className="h-4 w-4" />
              Original Content & Series
            </div>
            {/* Gradient Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-relaxed px-4 pb-2">
              Watch Our Stories
            </h1>
            {/* Italic Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 italic font-light max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Bringing anime to life—one frame at a time.
            </p>
            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{videos.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Videos</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-100">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{categories.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-green-100">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Views</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-100">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{avgDuration}</div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Duration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Tabs */}
      <CategoryTabs categories={categories} selectedCategory={selectedCategory} basePath="/watch" type="video" />

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Featured Videos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredVideos.map((video: any, index: number) => (
                <FeaturedVideoCard key={video.id} video={video} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "Latest Videos"
                  : `${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory} Videos`}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {filteredVideos.length === 0 ? (
            <EmptyState selectedCategory={selectedCategory} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                {regularVideos.map((video: any) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} selectedCategory={selectedCategory} />
              )}
            </>
          )}
        </div>
      </section>

      {/* YouTube Channel CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Subscribe to Our YouTube Channel</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Don't miss any of our latest content! Subscribe for weekly episodes, behind-the-scenes content, and anime news.
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg">
            <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
              <Youtube className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Subscribe on YouTube
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeaturedVideoCard({ video, priority = false }: { video: any; priority?: boolean }) {
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  return (
    <Link href={`/watch/${video.slug || video.id}`} className="group">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-gradient-to-br from-white to-gray-50">
        <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
          <img
            src={thumbnailUrl || "/placeholder.svg?height=256&width=512&text=Featured+Video"}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg text-xs">
              ⭐ Featured
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {video.duration}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Badge variant="secondary" className="mb-2 bg-white/90 backdrop-blur-sm text-xs">
              {video.category}
            </Badge>
            <h3 className="text-sm sm:text-lg font-bold text-white mb-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {video.title}
            </h3>
          </div>
        </div>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {video.title}
          </CardTitle>
          <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">{video.description}</p>
        </CardHeader>
        <CardContent className="pt-0 p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{new Date(video.publishedAt).toLocaleDateString()}</span>
                <span className="sm:hidden">
                  {new Date(video.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                {video.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {video.duration || "0:00"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function VideoCard({ video }: { video: any }) {
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  return (
    <Link href={`/watch/${video.slug || video.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group-hover:shadow-blue-500/25 bg-white">
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={thumbnailUrl || "/placeholder.svg?height=192&width=384&text=Video"}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 backdrop-blur-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            {video.duration}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
            <div className="bg-blue-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
          {video.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-lg text-xs">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
              {video.category}
            </Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">{new Date(video.publishedAt).toLocaleDateString()}</span>
              <span className="sm:hidden">
                {new Date(video.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </span>
          </div>
          <CardTitle className="text-base sm:text-lg lg:text-xl line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {video.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-4 sm:p-6">
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed text-sm">{video.description}</p>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                {video.views?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              {video.duration || "0:00"}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  selectedCategory,
}: { currentPage: number; totalPages: number; selectedCategory: string }) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (page > 1) params.set("page", page.toString());
    return `/watch${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {currentPage > 1 && (
        <Button asChild variant="outline" size="sm">
          <Link href={getPageUrl(currentPage - 1)}>Previous</Link>
        </Button>
      )}

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let page: number;
        if (totalPages <= 5) {
          page = i + 1;
        } else if (currentPage <= 3) {
          page = i + 1;
        } else if (currentPage >= totalPages - 2) {
          page = totalPages - 4 + i;
        } else {
          page = currentPage - 2 + i;
        }

        return (
          <Button key={page} asChild variant={page === currentPage ? "default" : "outline"} size="sm">
            <Link href={getPageUrl(page)}>{page}</Link>
          </Button>
        );
      })}

      {currentPage < totalPages && (
        <Button asChild variant="outline" size="sm">
          <Link href={getPageUrl(currentPage + 1)}>Next</Link>
        </Button>
      )}
    </div>
  );
}

function EmptyState({ selectedCategory }: { selectedCategory: string }) {
  return (
    <div className="text-center py-12 sm:py-16 lg:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {selectedCategory === "all" ? "No videos yet" : `No videos in this category`}
        </h3>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {selectedCategory === "all"
            ? "We're working on exciting video content about anime creation, tutorials, and behind-the-scenes footage. Check back soon!"
            : `No videos have been published in this category yet. Try selecting a different category or check back later.`}
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <p className="text-blue-800 text-sm">
            🎬 <strong>Content creators:</strong> Use the admin panel to upload your first video!
          </p>
        </div>
      </div>
    </div>
  );
}
