import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireCronAuth } from "@/lib/cronAuth";

const paths = ["/", "/blog", "/tags"] as const;

export async function POST(req: Request) {
  const auth = requireCronAuth(req);
  if (auth) return auth;
  try {
    for (const p of paths) {
      await revalidatePath(p);
    }
    return NextResponse.json({ revalidated: paths, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("revalidate cron failed", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}