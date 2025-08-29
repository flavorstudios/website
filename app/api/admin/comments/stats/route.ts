import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { format, getISOWeek } from "date-fns";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageComments"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collectionGroup("entries").get();
    const now = new Date();

    const past30 = new Date(now);
    past30.setDate(now.getDate() - 30);

    const past12w = new Date(now);
    past12w.setDate(now.getDate() - 84);

    const daily: Record<string, { total: number; spam: number }> = {};
    const weekly: Record<string, { total: number; spam: number }> = {};

    snap.docs.forEach((doc) => {
      const data = doc.data() as { createdAt?: string; status?: string };
      const createdAt = data.createdAt ? new Date(data.createdAt) : null;
      if (!createdAt || isNaN(createdAt.getTime())) return;

      if (createdAt >= past30) {
        const key = format(createdAt, "yyyy-MM-dd");
        daily[key] = daily[key] || { total: 0, spam: 0 };
        daily[key].total++;
        if (data.status === "spam") daily[key].spam++;
      }

      if (createdAt >= past12w) {
        const key = `${createdAt.getFullYear()}-W${getISOWeek(createdAt)}`;
        weekly[key] = weekly[key] || { total: 0, spam: 0 };
        weekly[key].total++;
        if (data.status === "spam") weekly[key].spam++;
      }
    });

    const dailyArr = Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { total, spam }]) => ({ date, count: total, spam }));

    const weeklyArr = Object.entries(weekly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, { total, spam }]) => ({ week, count: total, spam }));

    return NextResponse.json({ daily: dailyArr, weekly: weeklyArr });
  } catch (err) {
    console.error("[COMMENT_STATS]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
