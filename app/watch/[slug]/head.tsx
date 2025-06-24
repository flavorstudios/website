"use client";

import { use } from "react";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

async function getVideo(slug) {
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
        (video) =>
          (video.slug === slug || video.id === slug) && video.status === "published"
      ) || null
    );
  } catch {
    return null;
  }
}

export default function Head({ params }) {
  const video = use(getVideo(params.slug));

  if (!video) return null; // No schema for not-found

  const seoTitle = `${video.title} – Watch | ${SITE_NAME}`;
  const seoDescription =
    video.description ||
    `Watch original anime content crafted by ${SITE_NAME} — emotionally driven storytelling, 3D animation, and passion for creative expression.`;
  const thumbnailUrl =
    video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
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
            name: SITE_NAME,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/logo.png`,
            },
          },
        }),
      }}
    />
  );
}
