// app/watch/[slug]/page.tsx

import { getMetadata, getCanonicalUrl, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_DEFAULT_IMAGE } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Clock,
  ThumbsUp,
  Share2,
  Youtube,
  Calendar,
} from "lucide-react";
import { notFound } from "next/navigation";

// --- Type for video object
export interface Video {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string; // ISO 8601 string
  youtubeId: string;
  duration: string;
  views: number;
  thumbnail?: string;
  status: "published" | "draft";
  tags?: string[];
}

// --- Convert duration string to ISO 8601 (PT#M#S) ---
function toIsoDuration(duration: string): string | undefined {
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    const [mm, ss] = parts;
    return `PT${mm}M${ss}S`;
  } else if (parts.length === 3) {
    const [hh, mm, ss] = parts;
    return `PT${hh}H${mm}M${ss}S`;
  }
  return undefined;
}

// --- Fetch video utility ---
// *** ONLY THIS FUNCTION IS UPDATED! ***
async function getVideo(slug: string): Promise<Video | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || SITE_URL}/api/videos`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      console.error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    // --- Codex fix: Accept array or { videos: [...] } shape
    const videos: Video[] = Array.isArray(data) ? data : data.videos || [];
    return (
      videos.find(
        (video) =>
          (video.slug === slug || video.id === slug) && video.status === "published"
      ) || null
    );
  } catch (error) {
    console.error("Failed to fetch video due to exception:", error);
    return null;
  }
}

// === DYNAMIC METADATA ===
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const video = await getVideo(params.slug);

  if (!video) {
    const fallbackTitle = `Video Not Found – ${SITE_NAME}`;
    const fallbackDescription = `Sorry, this video could not be found. Explore more inspiring anime videos at ${SITE_NAME}.`;
    const fallbackImage = `${SITE_URL}/cover.jpg`;

    return getMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path: `/watch/${params.slug}`,
      robots: "noindex, follow",
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
            alt: `${SITE_NAME} – Not Found`,
          },
        ],
        type: "video.other",
      },
      twitter: {
        title: fallbackTitle,
        description: fallbackDescription,
        images: [fallbackImage],
      },
      alternates: {
        canonical: getCanonicalUrl(`/watch/${params.slug}`),
      },
    });
  }

  const canonicalUrl = getCanonicalUrl(`/watch/${video.slug || params.slug}`);
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  const seoTitle = `${video.title} – Watch | ${SITE_NAME}`;
  const seoDescription =
    video.description ||
    `Watch original anime content crafted by ${SITE_NAME} — emotionally driven storytelling, 3D animation, and passion for creative expression.`;

  return getMetadata({
    title: seoTitle,
    description: seoDescription,
    path: `/watch/${video.slug || params.slug}`,
    robots: "index,follow",
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "video.other",
      images: [
        {
          url: thumbnailUrl,
          width: 1280,
          height: 720,
        },
      ],
    },
    twitter: {
      title: seoTitle,
      description: seoDescription,
      images: [thumbnailUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  });
}

// === PAGE COMPONENT ===
export default async function VideoPage({ params }: { params: { slug: string } }) {
  const video = await getVideo(params.slug);

  if (!video) {
    notFound();
  }

  const canonicalUrl = getCanonicalUrl(`/watch/${video.slug || params.slug}`);
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  const youtubeChannelUrl = "https://www.youtube.com/channel/UC5dNbnWOG-gTlpS8iGimAag"; // <-- Your actual channel

  // --- JSON-LD VideoObject Schema ---
  const schema = getSchema({
    type: "VideoObject",
    path: `/watch/${video.slug || params.slug}`,
    name: video.title,
    description: video.description || "No description available.",
    thumbnailUrl: [thumbnailUrl],
    uploadDate: video.publishedAt,
    duration: toIsoDuration(video.duration) || video.duration,
    embedUrl,
    contentUrl: youtubeUrl,
    ...(video.tags && video.tags.filter(Boolean).length > 0
      ? { keywords: video.tags.filter(Boolean).join(",") }
      : {}),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* === SEO: Inject JSON-LD Schema === */}
      <StructuredData schema={schema} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{video.category}</Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {new Date(video.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {video.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    {(video.views || 0).toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {video.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" aria-hidden="true" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        canonicalUrl
                      )}&text=${encodeURIComponent(
                        `Watch "${video.title}" on ${SITE_NAME}!`
                      )}&hashtags=Anime,Animation`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      Share
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">About this video</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{video.description}</p>
                {video.tags && video.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.filter(Boolean).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Youtube className="h-12 w-12 text-red-600 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold mb-2">Watch on YouTube</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Like, comment, and subscribe on our YouTube channel for more content!
                </p>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 mr-2" aria-hidden="true" />
                    Open in YouTube
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Flavor Studios</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Creating original anime content, behind-the-scenes insights, and industry tutorials.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Subscribe to Channel
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Video Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{video.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{(video.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <Badge variant="secondary">{video.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
