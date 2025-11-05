import type { BlogPost, Video } from "@/lib/types";

export type E2ENotification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
  priority: "normal" | "high";
  href?: string;
  type: string;
  data?: Record<string, unknown>;
};

const globalKey = Symbol.for("flavorstudios.e2eState");

type FixturesState = {
  blogPosts: BlogPost[];
  videos: (Video & {
    status: "draft" | "published";
    views: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    featured?: boolean;
    description?: string;
    tags?: string[];
  })[];
  notifications: E2ENotification[];
};

const baseBlogPosts: BlogPost[] = [
  {
    id: "blog-e2e-1",
    title: "Flavor Studios Launches New Anthology Series",
    slug: "flavor-studios-launches-new-anthology-series",
    content:
      "<p>We are thrilled to debut a twelve-episode anthology showcasing emerging directors from our global collective. Expect dazzling visual experiments and heartfelt storytelling.</p>",
    excerpt:
      "We just announced a new anthology series that highlights the directors shaping Flavor Studios' next chapter.",
    status: "published",
    category: "Announcements",
    categories: ["Announcements", "Studios"],
    tags: ["news", "release"],
    featuredImage: "/cover.jpg",
    seoTitle: "New Anthology Series Announcement",
    seoDescription: "Flavor Studios introduces a new anthology with bold directors and original stories.",
    author: "Flavor Studios Editorial",
    publishedAt: "2024-01-15T10:00:00.000Z",
    createdAt: "2024-01-10T09:00:00.000Z",
    updatedAt: "2024-01-20T14:30:00.000Z",
    views: 1824,
    readTime: "6 min",
    commentCount: 8,
    shareCount: 34,
    schemaType: "Article",
    openGraphImage: "/cover.jpg",
  },
  {
    id: "blog-e2e-2",
    title: "Production Update: Episode 7 Storyboards",
    slug: "production-update-episode-7-storyboards",
    content:
      "<p>Storyboard artist Hana gives a peek behind the scenes of Episode 7, revealing how we merge hand-drawn layouts with volumetric lighting.</p>",
    excerpt:
      "Hana walks through the storyboard process for Episode 7 and how the team iterates fast without losing detail.",
    status: "published",
    category: "Production",
    categories: ["Production"],
    tags: ["behind-the-scenes", "storyboard"],
    featuredImage: "/cover.jpg",
    seoTitle: "Episode 7 Storyboard Deep Dive",
    seoDescription: "Inside the storyboard workflows powering Flavor Studios' Episode 7.",
    author: "Hana Ito",
    publishedAt: "2024-02-05T16:00:00.000Z",
    createdAt: "2024-02-02T09:30:00.000Z",
    updatedAt: "2024-02-06T11:15:00.000Z",
    views: 956,
    readTime: "5 min",
    commentCount: 3,
    shareCount: 11,
    schemaType: "Article",
    openGraphImage: "/cover.jpg",
  },
];

const baseVideos: FixturesState["videos"] = [
  {
    id: "video-e2e-1",
    title: "Director Commentary: Building Worlds",
    slug: "director-commentary-building-worlds",
    youtubeId: "X1Y2Z3",
    thumbnail: "https://img.youtube.com/vi/X1Y2Z3/maxresdefault.jpg",
    description:
      "Creative director Nina explains how the art team balances stylised design with grounded lighting cues in the new anthology.",
    category: "Behind the Scenes",
    tags: ["commentary", "design"],
    status: "published",
    publishedAt: "2024-01-22T12:00:00.000Z",
    duration: "08:41",
    featured: true,
    views: 4212,
    createdAt: "2024-01-20T12:00:00.000Z",
    updatedAt: "2024-01-22T12:00:00.000Z",
  },
  {
    id: "video-e2e-2",
    title: "Animator Breakdown: Combat Choreography",
    slug: "animator-breakdown-combat-choreography",
    youtubeId: "A7B8C9",
    thumbnail: "https://img.youtube.com/vi/A7B8C9/maxresdefault.jpg",
    description:
      "Lead animator Marco details how the choreography team shot reference footage for the finale's duel sequence.",
    category: "Production",
    tags: ["animation", "combat"],
    status: "published",
    publishedAt: "2024-02-12T18:30:00.000Z",
    duration: "06:28",
    featured: false,
    views: 3120,
    createdAt: "2024-02-10T18:30:00.000Z",
    updatedAt: "2024-02-12T18:30:00.000Z",
  },
];

const baseNotifications: E2ENotification[] = [
  {
    id: "notify-e2e-1",
    title: "New comment awaiting review",
    message: "Alex Chen commented on 'Episode 7 Storyboards'.",
    timestamp: "2024-02-20T09:15:00.000Z",
    read: false,
    category: "comment",
    priority: "high",
    href: "/admin/dashboard/comments",
    type: "comment",
    data: { postId: "blog-e2e-2" },
  },
  {
    id: "notify-e2e-2",
    title: "Weekly report ready",
    message: "Your posts and videos performance summary is available.",
    timestamp: "2024-02-19T17:45:00.000Z",
    read: true,
    category: "report",
    priority: "normal",
    href: "/admin/dashboard",
    type: "report",
  },
];

function cloneBlogPost(post: BlogPost): BlogPost {
  return JSON.parse(JSON.stringify(post));
}

function cloneVideo(video: FixturesState["videos"][number]): FixturesState["videos"][number] {
  return JSON.parse(JSON.stringify(video));
}

function cloneNotification(notification: E2ENotification): E2ENotification {
  return JSON.parse(JSON.stringify(notification));
}

function ensureState(): FixturesState {
  const globalObj = globalThis as Record<PropertyKey, unknown>;
  if (!globalObj[globalKey]) {
    globalObj[globalKey] = {
      blogPosts: baseBlogPosts.map(cloneBlogPost),
      videos: baseVideos.map(cloneVideo),
      notifications: baseNotifications.map(cloneNotification),
    } satisfies FixturesState;
  }
  return globalObj[globalKey] as FixturesState;
}

export function getE2EBlogPosts(): BlogPost[] {
  return ensureState().blogPosts.map(cloneBlogPost);
}

export function addE2EBlogPost(post: BlogPost): BlogPost {
  const state = ensureState();
  state.blogPosts = [cloneBlogPost(post), ...state.blogPosts];
  return cloneBlogPost(post);
}

export function updateE2EBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const state = ensureState();
  const idx = state.blogPosts.findIndex((post) => post.id === id);
  if (idx === -1) return null;
  const updated = { ...state.blogPosts[idx], ...updates } as BlogPost;
  state.blogPosts[idx] = cloneBlogPost(updated);
  return cloneBlogPost(updated);
}

export function getE2EBlogPostById(id: string): BlogPost | null {
  const state = ensureState();
  const found = state.blogPosts.find((post) => post.id === id);
  return found ? cloneBlogPost(found) : null;
}

export function getE2EVideos(): FixturesState["videos"] {
  return ensureState().videos.map(cloneVideo);
}

export function addE2EVideo(video: FixturesState["videos"][number]) {
  const state = ensureState();
  state.videos = [cloneVideo(video), ...state.videos];
}

export function getE2ENotifications(): E2ENotification[] {
  return ensureState().notifications.map(cloneNotification);
}

export function setE2ENotifications(notifications: E2ENotification[]) {
  const state = ensureState();
  state.notifications = notifications.map(cloneNotification);
}

export const E2E_DASHBOARD_HISTORY = [
  { label: "Posts", data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { label: "Videos", data: [0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 5] },
  { label: "Comments", data: [2, 1, 0, 3, 1, 4, 2, 3, 2, 4, 3, 5] },
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const postsHistory = E2E_DASHBOARD_HISTORY[0]?.data ?? [];
const videosHistory = E2E_DASHBOARD_HISTORY[1]?.data ?? [];
const commentsHistory = E2E_DASHBOARD_HISTORY[2]?.data ?? [];

export const E2E_STATS_HISTORY_MONTHLY = MONTH_LABELS.map((month, index) => ({
  month,
  posts: postsHistory[index] ?? 0,
  videos: videosHistory[index] ?? 0,
  comments: commentsHistory[index] ?? 0,
}));