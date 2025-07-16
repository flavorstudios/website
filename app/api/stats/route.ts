import { NextResponse } from "next/server";
import { systemStore } from "@/lib/admin-store"; // Or content-store if renamed

export async function GET() {
  try {
    const stats = await systemStore.getStats();
    const res = NextResponse.json(stats);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    console.error("Failed to fetch public stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
