import { revalidatePath, revalidateTag } from "next/cache";
import { handleCron } from "@/lib/cron";

const paths = ["/", "/blog", "/tags"] as const;

export async function POST(req: Request) {
  return handleCron("revalidate", req, async () => {
    await Promise.all(paths.map((p) => revalidatePath(p, "page")));
    await revalidateTag("feeds");
    return { artifacts: [...paths, "feeds"] };
  });
}