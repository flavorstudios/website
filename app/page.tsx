// app/page.tsx

import { StructuredData } from "@/components/StructuredData";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import LatestBlogsSection from "@/components/home/LatestBlogsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import WatchSection from "@/components/home/WatchSection";
import CallToActionSection from "@/components/home/CallToActionSection";

import {
  SITE_NAME,
  SITE_URL,
  SITE_BRAND_TWITTER,
  SITE_DESCRIPTION, // ✅ Import centralized description
} from "@/lib/constants";

import { getMetadata } from "@/lib/seo/metadata";
import { getSchema } from "@/lib/seo/schema";
import type { BlogPost, Video } from "@/lib/content-store";

// --- SEO: Metadata for Home Page ---
export const metadata = getMetadata({
  title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
  description: SITE_DESCRIPTION, // ✅ Use constant
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
    description: SITE_DESCRIPTION, // ✅ Use constant
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
    description: SITE_DESCRIPTION, // ✅ Use constant
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// --- JSON-LD WebPage Schema ---
const schema = getSchema({
  type: "WebPage",
  path: "/",
  title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
  description: SITE_DESCRIPTION, // ✅ Use constant
  image: `${SITE_URL}/cover.jpg`,
});

async function getHomePageContent() {
  const fallbackContent = {
    latestBlogs: [],
    featuredVideos: [],
    stats: null,
  };
  if (process.env.NODE_ENV === "development") return fallbackContent;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
    const [statsResult, videosResult, blogsResult] = await Promise.allSettled([
      fetch(`${baseUrl}/api/stats`, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${baseUrl}/api/videos`, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${baseUrl}/api/blogs`, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.json() : null)),
    ]);
    // Stats: just assign the object
    const stats = statsResult.status === "fulfilled" && statsResult.value ? statsResult.value : null;
    // Videos: handle array or .videos (future-proof)
    const videos = videosResult.status === "fulfilled" && videosResult.value
      ? (Array.isArray(videosResult.value)
          ? videosResult.value
          : videosResult.value.videos || []
        ).filter((v: Video) => v.status === "published")
      : [];
    // Blogs: handle array or .posts (future-proof)
    const blogs = blogsResult.status === "fulfilled" && blogsResult.value
      ? (Array.isArray(blogsResult.value)
          ? blogsResult.value
          : blogsResult.value.posts || []
        ).filter((p: BlogPost) => p.status === "published").slice(0, 6)
      : [];
    return { stats, featuredVideos: videos, latestBlogs: blogs };
  } catch (error) {
    console.error("Failed to fetch homepage content:", error);
    return fallbackContent;
  }
}

export default async function HomePage() {
  const content = await getHomePageContent();
  return (
    <div className="min-h-screen">
      {/* SEO: Inject JSON-LD */}
      {schema && <StructuredData schema={schema} />}

      <HeroSection />
      <StatsSection stats={content.stats} />
      <LatestBlogsSection posts={content.latestBlogs} />
      <NewsletterSection />
      <WatchSection videos={content.featuredVideos} />
      <CallToActionSection />
    </div>
  );
}
