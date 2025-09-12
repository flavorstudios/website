import { handleCron } from "@/lib/cron";

export async function POST(req: Request) {
  return handleCron("backup", req, async () => {
    // TODO: hook into real backup system
    return { artifacts: [] };
  });
}