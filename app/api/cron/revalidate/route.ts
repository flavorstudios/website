import { revalidatePath, revalidateTag } from "next/cache";
import { handleCron } from "@/lib/cron";

const paths = ["/", "/blog", "/tags"] as const;

export async function POST(req: Request) {
  return handleCron("revalidate", req, async () => {
    for (const p of paths) {
      await revalidatePath(p);
    }
    await revalidateTag("feeds");
    return { artifacts: [...paths, "feeds"] };
  });
}