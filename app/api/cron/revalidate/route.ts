import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireCronAuth } from "@/lib/cronAuth";

const paths = ["/", "/blog", "/tags"] as const;

export async function POST(req: Request) {
  const auth = await requireCronAuth(req);
  if (auth) return auth;
  try {
    for (const p of paths) {
      await revalidatePath(p);
    }
    await revalidateTag("feeds");
    return NextResponse.json({
      ok: true,
      job: "revalidate",
      artifacts: [...paths, "feeds"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("revalidate cron failed", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}