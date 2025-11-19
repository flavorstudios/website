import { handleCron } from "@/lib/cron";
import { getFeedVariants, revalidateRssFeeds, warmFeedCache } from "@/lib/rss-feed-service";

export async function POST(req: Request) {
  return handleCron("build-rss", req, async () => {
    await revalidateRssFeeds();
    const snapshots = await Promise.all(getFeedVariants().map((variant) => warmFeedCache(variant)));
    return {
      artifacts: snapshots.map((snapshot) => ({
        path: snapshot.selfPath,
        variant: snapshot.variant,
        items: snapshot.itemCount,
        bytes: snapshot.byteLength,
        lastModified: snapshot.lastModified,
      })),
    };
  });
}