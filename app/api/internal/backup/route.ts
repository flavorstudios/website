import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = requireCronAuth(req);
  if (auth) return auth;
  // TODO: hook into real backup system
  return NextResponse.json({ ok: true, message: "backup trigger noop", timestamp: new Date().toISOString() });
}