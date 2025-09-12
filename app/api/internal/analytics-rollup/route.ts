import { handleCron } from "@/lib/cron";

export async function POST(req: Request) {
  return handleCron("analytics-rollup", req, async () => {
    // TODO: implement analytics aggregation
    return { artifacts: [] };
  });
}