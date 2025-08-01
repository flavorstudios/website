import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserRole } from "@/lib/user-roles";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const pageToken = url.searchParams.get("pageToken") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 1000);
    const result = await adminAuth.listUsers(limit, pageToken);
    let users = result.users;
    if (search) {
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.displayName?.toLowerCase().includes(search)
      );
    }
    const withRole = await Promise.all(
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
    return NextResponse.json({ users: withRole, nextPageToken: result.pageToken || null });
  } catch (err) {
    console.error("[ADMIN_USERS_LIST]", err);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}