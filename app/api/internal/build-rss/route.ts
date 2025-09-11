import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireCronAuth } from "@/lib/cronAuth";

export async function POST(req: Request) {
  const auth = requireCronAuth(req);
  if (auth) return auth;
  try {
    revalidatePath("/rss.xml");
    return NextResponse.json({ rebuilt: ["/rss.xml"], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("rss rebuild failed", error);
    return NextResponse.json({ error: "Failed to rebuild RSS" }, { status: 500 });
  }
}