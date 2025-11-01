import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getUserRole, setUserRole } from "@/lib/user-roles";
import { logError } from "@/lib/log";
import { logActivity } from "@/lib/activity-log";

type RouteContext = { params: { uid: string } };

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { uid } = params;
  try {
    const auth = getAdminAuth();
    const userRecord = await auth.getUser(uid);
    const role = await getUserRole(uid, userRecord.email || undefined);
    return NextResponse.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified, // <-- Added for verified badge
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        role,
        createdAt: userRecord.metadata.creationTime,
        lastLogin: userRecord.metadata.lastSignInTime,
      },
    });
  } catch (err) {
    logError("admin-users:get", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { uid } = params;
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    const { role, disabled } = await request.json();
    if (typeof role !== "undefined") {
      await setUserRole(uid, role);
    }
    if (typeof disabled !== "undefined") {
      await auth.updateUser(uid, { disabled: !!disabled });
    }
    const actor = await getSessionInfo(request);
    try {
      await db.collection("admin_audit_logs").add({
        actor: actor?.email || actor?.uid || "unknown",
        action: "update_user",
        target: uid,
        changes: { role, disabled },
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      logError("admin-users:audit", e);
    }
    await logActivity({
      type: "user.update",
      title: `Updated user ${uid}`,
      description: JSON.stringify({ role, disabled }),
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("admin-users:patch", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { uid } = params;
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    await auth.deleteUser(uid);
    const actor = await getSessionInfo(request);
    try {
      await db.collection("admin_audit_logs").add({
        actor: actor?.email || actor?.uid || "unknown",
        action: "delete_user",
        target: uid,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      logError("admin-users:audit", e);
    }
    await logActivity({
      type: "user.delete",
      title: `Deleted user ${uid}`,
      status: "success",
      user: actor?.email || actor?.uid || "unknown",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("admin-users:delete", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
