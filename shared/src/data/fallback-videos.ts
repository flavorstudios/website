import type { VideoRecord } from "../types";

export const FALLBACK_VIDEOS: VideoRecord[] = [
  {
    id: "fallback-video-behind-the-scenes",
    title: "Behind the Scenes with Flavor Studios",
    slug: "behind-the-scenes",
    description: "A quick look at how our team plans shoots and edits stories.",
    category: "Studio",
    categories: ["Studio"],
    tags: ["studio", "bts"],
    thumbnail: "/videos/behind-the-scenes.jpg",
    videoUrl: "https://cdn.example.com/video.mp4",
    duration: "3:12",
    featured: true,
    publishedAt: "2024-02-01T12:00:00.000Z",
  },
  {
    id: "fallback-video-community-spotlight",
    title: "Community Spotlight: Cosplay Edition",
    slug: "community-spotlight-cosplay",
    description: "We interview three cosplayers about craft and culture.",
    category: "Community",
    categories: ["Community"],
    tags: ["cosplay"],
    thumbnail: "/videos/community-spotlight.jpg",
    videoUrl: "https://cdn.example.com/video2.mp4",
    duration: "5:45",
    featured: false,
    publishedAt: "2024-03-12T09:00:00.000Z",
  },
];