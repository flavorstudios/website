import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = await requireCronAuth(req);
  if (auth) return auth;
  // TODO: hook into real backup system
  rreturn NextResponse.json({
    ok: true,
    job: "backup",
    artifacts: [],
    timestamp: new Date().toISOString(),
  });
}