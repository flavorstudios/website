import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = requireCronAuth(req);
  if (auth) return auth;
  try {
    await revalidatePath("/sitemap.xml");
    return NextResponse.json({ rebuilt: ["/sitemap.xml"], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("sitemap rebuild failed", error);
    return NextResponse.json({ error: "Failed to rebuild sitemap" }, { status: 500 });
  }
}