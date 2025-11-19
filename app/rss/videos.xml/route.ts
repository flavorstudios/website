import { SITE_NAME } from "@/lib/constants";
import { createRssResponse } from "@/lib/rss/route-helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  return createRssResponse("videos", `${SITE_NAME} video feed fallback`);
}