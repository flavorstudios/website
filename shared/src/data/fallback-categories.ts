import type { CategoryRecord } from "../types";

export const FALLBACK_CATEGORIES: CategoryRecord[] = [
  {
    id: "cat-blog-all",
    slug: "all-posts",
    title: "All Posts",
    description: "Every story published on the blog.",
    type: "blog",
    order: 1,
    isActive: true,
  },
  {
    id: "cat-blog-culture",
    slug: "culture",
    title: "Culture",
    description: "Studio rituals and community moments.",
    type: "blog",
    order: 2,
    isActive: true,
  },
  {
    id: "cat-video-all",
    slug: "all-videos",
    title: "All Videos",
    description: "Watch every release in one feed.",
    type: "video",
    order: 1,
    isActive: true,
  },
  {
    id: "cat-video-interviews",
    slug: "interviews",
    title: "Interviews",
    description: "Conversations with our guests and collaborators.",
    type: "video",
    order: 2,
    isActive: true,
  },
];