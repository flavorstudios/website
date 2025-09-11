import { NextResponse } from "next/server";

const secret = process.env.CRON_SECRET;
if (!secret) {
  throw new Error("CRON_SECRET environment variable is required");
}

export function requireCronAuth(req: Request): NextResponse | null {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}