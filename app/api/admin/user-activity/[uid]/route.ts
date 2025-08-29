import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uid } = await params;
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    const user = await adminAuth.getUser(uid);
    const email = user.email || "";
    const snap = await db
      .collection("login_events")
      .where("email", "==", email)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const activities = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
    return NextResponse.json({ activities });
  } catch (err) {
    logError("user-activity:get", err);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}