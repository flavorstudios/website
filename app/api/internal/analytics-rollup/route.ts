import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = await requireCronAuth(req);
  if (auth) return auth;
  // TODO: implement analytics aggregation
  return NextResponse.json({
    ok: true,
    job: "analytics-rollup",
    artifacts: [],
    timestamp: new Date().toISOString(),
  });
}