// app/api/admin/user-role/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, requireAdmin } from "@/lib/admin-auth"; // Use this for universal session support!
import { getUserRole, setUserRole } from "@/lib/user-roles"; // canonical role utils
import { logError } from "@/lib/log";
import type { UserRole } from "@/lib/role-permissions";

// GET: returns { role } for the authenticated user (admin/editor/support)
// Returns 401 for unauthorized, 500 for errors, and "support" only if user has no role record.
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionCookie = req.cookies.get("admin-session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ---- Updated: Use verifyAdminSession instead of verifySessionCookie ----
    const verified = await verifyAdminSession(sessionCookie); // Handles Firebase + JWT
    const role = await getUserRole(verified.uid);

    if (role === "admin" || role === "editor" || role === "support") {
      return NextResponse.json({ role });
    } else {
      // No explicit role found; treat as 'support'
      return NextResponse.json({ role: "support" });
    }
  } catch (err) {
    logError("user-role:get", err);
    // Surface error for frontend, as Codex recommends
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }
}

// POST: sets { uid, role } for a user; requires admin
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { uid, role } = await req.json();
    if (!uid || !role) {
      return NextResponse.json({ error: "Missing uid or role" }, { status: 400 });
    }
    if (!["admin", "editor", "support"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    // Unified role collection: always use "roles"
    await setUserRole(uid, role as UserRole);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("user-role:post", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
