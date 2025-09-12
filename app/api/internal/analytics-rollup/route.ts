import { handleCron } from "@/lib/cron";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  return handleCron("analytics-rollup", req, async () => {
    if (!adminDb) return { artifacts: [] };

    // Fetch raw analytics events
    const rawSnap = await adminDb.collection("analyticsRaw").get();
    const rollups: Record<string, number> = {};

    rawSnap.forEach((doc) => {
      const data = doc.data() as { timestamp: Timestamp; count?: number };
      const day = data.timestamp
        .toDate()
        .toISOString()
        .slice(0, 10);
      rollups[day] = (rollups[day] || 0) + (data.count ?? 0);
    });

    // Persist aggregated results
    const batch = adminDb.batch();
    Object.entries(rollups).forEach(([date, total]) => {
      const ref = adminDb.collection("analyticsRollups").doc(date);
      batch.set(
        ref,
        { date, total, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    });

    if (Object.keys(rollups).length) {
      await batch.commit();
    }

    const artifacts = Object.entries(rollups).map(([date, total]) => ({
      date,
      total,
    }));

    return { artifacts };
  });
}