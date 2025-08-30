import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getUserRole } from "@/lib/user-roles";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const pageToken = url.searchParams.get("pageToken") || undefined;
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      1000,
    );
    const roleFilter = url.searchParams.get("role") || "";
    const statusFilter = url.searchParams.get("status") || "";
    const verifiedFilter = url.searchParams.get("verified") || "";
    const sort = url.searchParams.get("sort") || "created";

    const auth = getAdminAuth();
    const result = await auth.listUsers(limit, pageToken);
    let users = result.users;
    if (search) {
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.displayName?.toLowerCase().includes(search),
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
        emailVerified: u.emailVerified,
        lastLogin: u.metadata.lastSignInTime,
      })),
    );

    if (roleFilter && roleFilter !== "all") {
      withRole = withRole.filter((u) => u.role === roleFilter);
    }
    if (statusFilter === "active") {
      withRole = withRole.filter((u) => !u.disabled);
    } else if (statusFilter === "disabled") {
      withRole = withRole.filter((u) => u.disabled);
    }

    if (verifiedFilter === "verified") {
      withRole = withRole.filter((u) => u.emailVerified);
    } else if (verifiedFilter === "unverified") {
      withRole = withRole.filter((u) => !u.emailVerified);
    }

    withRole.sort((a, b) => {
      switch (sort) {
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "role":
          return a.role.localeCompare(b.role);
        case "status":
          return Number(a.disabled) - Number(b.disabled);
          case "lastLogin":
          return (
            new Date(b.lastLogin || 0).getTime() -
            new Date(a.lastLogin || 0).getTime()
          );
        case "created":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return NextResponse.json({
      users: withRole,
      nextPageToken: result.pageToken || null,
    });
  } catch (err) {
    console.error("[ADMIN_USERS_LIST]", err);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 },
    );
  }
}