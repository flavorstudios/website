import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getUserRole, setUserRole } from "@/lib/user-roles";
import { logError } from "@/lib/log";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const pageToken = url.searchParams.get("pageToken") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 1000);
    const roleFilter = url.searchParams.get("role") || "";
    const statusFilter = url.searchParams.get("status") || "";
    const sort = url.searchParams.get("sort") || "created";

    const auth = getAdminAuth();
    const result = await auth.listUsers(limit, pageToken);
    let users = result.users;
    if (search) {
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.displayName?.toLowerCase().includes(search)
      );
    }

    let withRole = await Promise.all(
      users.map(async (u) => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        disabled: u.disabled,
        role: await getUserRole(u.uid, u.email || undefined),
        createdAt: u.metadata.creationTime,
      }))
    );

    if (roleFilter && roleFilter !== "all") {
      withRole = withRole.filter((u) => u.role === roleFilter);
    }
    if (statusFilter === "active") {
      withRole = withRole.filter((u) => !u.disabled);
    } else if (statusFilter === "disabled") {
      withRole = withRole.filter((u) => u.disabled);
    }

    withRole.sort((a, b) => {
      switch (sort) {
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "role":
          return a.role.localeCompare(b.role);
        case "status":
          return Number(a.disabled) - Number(b.disabled);
        case "created":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return NextResponse.json({ users: withRole, nextPageToken: result.pageToken || null });
  } catch (err) {
    console.error("[ADMIN_USERS_LIST]", err);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { ids, role, disabled, delete: del } = body || {};
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (typeof role !== "undefined" && typeof role !== "string") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (typeof disabled !== "undefined" && typeof disabled !== "boolean") {
      return NextResponse.json({ error: "Invalid disabled value" }, { status: 400 });
    }
    if (del) {
      if (typeof role !== "undefined" || typeof disabled !== "undefined") {
        return NextResponse.json(
          { error: "Cannot combine delete with other updates" },
          { status: 400 },
        );
      }
    } else if (typeof role === "undefined" && typeof disabled === "undefined") {
      return NextResponse.json({ error: "No updates specified" }, { status: 400 });
    }
    const actor = await getSessionInfo(request);
    const auth = getAdminAuth();
    const db = getAdminDb();
    const results: Record<string, { ok: boolean; error?: string }> = {};
    for (const uid of ids) {
      try {
        if (del) {
          await auth.deleteUser(uid);
          await db.collection("admin_audit_logs").add({
            actor: actor?.email || actor?.uid || "unknown",
            action: "delete_user",
            target: uid,
            timestamp: new Date().toISOString(),
          });
        } else {
          if (typeof role !== "undefined") {
            await setUserRole(uid, role);
          }
          if (typeof disabled !== "undefined") {
            await auth.updateUser(uid, { disabled });
          }
          await auth.updateUser(uid, { disabled });
            actor: actor?.email || actor?.uid || "unknown",
            action: "update_user",
            target: uid,
            changes: { role, disabled },
            timestamp: new Date().toISOString(),
          });
        }
        
        results[uid] = { ok: true };
      } catch (e) {
        logError("admin-users:bulk", e);
        results[uid] = { ok: false, error: (e as Error)?.message || "Unknown error" };
      }
    }
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    logError("admin-users:bulk", err);
    return NextResponse.json({ error: "Failed to update users" }, { status: 500 });
  }
}
