// app/api/stats/route.ts

import { NextResponse } from "next/server";
import { systemStore } from "@/lib/system-store"; // Firestore-backed stats

export async function GET() {
  try {
    // Fetch system stats from Firestore (systemStore.getStats handles it)
    const stats = await systemStore.getStats();

    // Send response with cache-control for 5 minutes
    const res = NextResponse.json(stats);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  } catch (error) {
    // Log for server diagnostics only (never expose details to client)
    console.error("Failed to fetch public stats:", error);

    // Return a safe error response
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
