import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const { uid } = await context.params;
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("admin_audit_logs")
      .where("target", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const logs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
    return NextResponse.json({ logs });
  } catch (err) {
    logError("audit-logs:get", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}