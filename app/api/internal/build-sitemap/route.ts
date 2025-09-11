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
    console.error("sitemap rebuild failed", error);
    return NextResponse.json({ error: "Failed to rebuild sitemap" }, { status: 500 });
  }
}