import { revalidatePath } from "next/cache";
import { handleCron } from "@/lib/cron";

export async function POST(req: Request) {
  return handleCron("build-rss", req, async () => {
    await revalidatePath("/rss.xml", "page");
    return { artifacts: ["/rss.xml"] };
  });
}