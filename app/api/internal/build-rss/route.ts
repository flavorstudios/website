import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = requireCronAuth(req);
  if (auth) return auth;
  try {
    await revalidateTag("feeds");
    return NextResponse.json({ revalidatedTags: ["feeds"], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("rss rebuild failed", error);
    return NextResponse.json({ error: "Failed to rebuild RSS" }, { status: 500 });
  }
}