// --- WATCH PAGE WITH SEO-COMPLIANT METADATA ---

import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Youtube, Clock, Share2, ThumbsUp } from "lucide-react";
import { getMetadata } from "@/lib/seo-utils";

interface VideoPageProps {
  params: { slug: string };
}

async function getVideo(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/videos`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const videos = data.videos || [];
    return (
      videos.find(
        (video: any) =>
          (video.slug === slug || video.id === slug) && video.status === "published"
      ) || null
    );
  } catch (error) {
    console.error("Failed to fetch video:", error);
    return null;
  }
}

export async function generateMetadata({ params }: VideoPageProps) {
  const video = await getVideo(params.slug);

  if (!video) {
    const fallbackTitle = "Video Not Found – Flavor Studios";
    const fallbackDescription = "Sorry, this video could not be found. Explore more inspiring anime videos at Flavor Studios.";
    const fallbackUrl = `https://flavorstudios.in/watch/${params.slug}`;
    const fallbackImage = "https://flavorstudios.in/cover.jpg";

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: {
        canonical: fallbackUrl,
      },
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: fallbackUrl,
        type: "website",
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
            alt: "Flavor Studios – Not Found",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
        images: [fallbackImage],
      },
      robots: "noindex, follow",
    };
  }

  const canonicalUrl = `https://flavorstudios.in/watch/${video.slug || params.slug}`;
  const thumbnailUrl =
    video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  const seoTitle = `${video.title} – Watch | Flavor Studios`;
  const seoDescription =
    video.description ||
    "Watch original anime content crafted by Flavor Studios — emotionally driven storytelling, 3D animation, and passion for creative expression.";

  return getMetadata({
    title: seoTitle,
    description: seoDescription,
    path: `/watch/${video.slug || params.slug}`,
    robots: "index,follow",
    openGraph: {
      images: [
        {
          url: thumbnailUrl,
          width: 1280,
          height: 720,
        },
      ],
      type: "video.other",
      url: canonicalUrl,
      title: seoTitle,
      description: seoDescription,
    },
    twitter: {
      card: "summary_large_image",
      site: "@flavorstudios",
      creator: "@flavorstudios",
      images: [thumbnailUrl],
      title: seoTitle,
      description: seoDescription,
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: seoTitle,
      description: seoDescription,
      thumbnailUrl: [thumbnailUrl],
      uploadDate: video.publishedAt,
      duration: video.duration,
      embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: { "@type": "WatchAction" },
        userInteractionCount: video.views,
      },
      publisher: {
        "@type": "Organization",
        name: "Flavor Studios",
        logo: {
          "@type": "ImageObject",
          url: "https://flavorstudios.in/logo.png",
        },
      },
    },
  });
}

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await getVideo(params.slug);

  if (!video) {
    notFound();
  }

  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <Calendar className="h-3 w-3" />
                  {new Date(video.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {video.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {video.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        `https://flavorstudios.in/watch/${video.slug || params.slug}`
                      )}&text=${encodeURIComponent(
                        `Watch \"${video.title}\" on Flavor Studios!`
                      )}&hashtags=Anime,Animation`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
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
                      {video.tags.map((tag: string) => (
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
                <Youtube className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Watch on YouTube</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Like, comment, and subscribe on our YouTube channel for more content!
                </p>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 mr-2" />
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
                    href="https://www.youtube.com/@flavorstudios"
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
                    <span className="font-medium">{video.views.toLocaleString()}</span>
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
