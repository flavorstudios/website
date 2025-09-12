import { revalidatePath } from "next/cache";
import { handleCron } from "@/lib/cron";

export async function POST(req: Request) {
  return handleCron("build-sitemap", req, async () => {
    await revalidatePath("/sitemap.xml", "page");
    return { artifacts: ["/sitemap.xml"] };
  });
}