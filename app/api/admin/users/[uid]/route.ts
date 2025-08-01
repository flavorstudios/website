import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getUserRole, setUserRole } from "@/lib/user-roles";
import { logError } from "@/lib/log";

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const userRecord = await adminAuth.getUser(params.uid);
    const role = await getUserRole(params.uid, userRecord.email || undefined);
    return NextResponse.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        role,
        createdAt: userRecord.metadata.creationTime,
      },
    });
  } catch (err) {
    logError("admin-users:get", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { role, disabled } = await request.json();
    if (typeof role !== "undefined") {
      await setUserRole(params.uid, role);
    }
    if (typeof disabled !== "undefined") {
      await adminAuth.updateUser(params.uid, { disabled: !!disabled });
    }
    const actor = await getSessionInfo(request);
    try {
      await adminDb.collection("admin_audit_logs").add({
        actor: actor?.email || actor?.uid || "unknown",
        action: "update_user",
        target: params.uid,
        changes: { role, disabled },
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      logError("admin-users:audit", e);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("admin-users:patch", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}