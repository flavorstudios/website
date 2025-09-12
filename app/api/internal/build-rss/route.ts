import { revalidateTag } from "next/cache";
import { handleCron } from "@/lib/cron";

export async function POST(req: Request) {
  return handleCron("build-rss", req, async () => {
    await revalidateTag("feeds");
    return { artifacts: ["feeds"] };
  });
}