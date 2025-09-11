import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = requireCronAuth(req);
  if (auth) return auth;
  // TODO: implement analytics aggregation
  return NextResponse.json({ ok: true, message: "analytics rollup noop", timestamp: new Date().toISOString() });
}