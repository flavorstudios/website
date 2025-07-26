// app/api/admin/user-role/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, requireAdmin } from "@/lib/admin-auth"; // Universal session support
import { getUserRole, setUserRole } from "@/lib/user-roles"; // Canonical role utils
import { logError } from "@/lib/log";
import type { UserRole } from "@/lib/role-permissions";

// GET: returns { role } for the authenticated user (admin/editor/support)
// Returns 401 for unauthorized, 500 for errors, and "support" only if user has no role record.
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      if (process.env.DEBUG_ADMIN === "true") {
        console.warn("[user-role] Unauthorized access attempt.");
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionCookie = req.cookies.get("admin-session")?.value;
    if (!sessionCookie) {
      if (process.env.DEBUG_ADMIN === "true") {
        console.warn("[user-role] Missing session cookie.");
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ---- Use verifyAdminSession for universal session support ----
    const verified = await verifyAdminSession(sessionCookie); // Handles Firebase + JWT
    if (process.env.DEBUG_ADMIN === "true") {
      console.log("[user-role] Verified admin:", {
        uid: verified?.uid,
        email: verified?.email,
      });
    }
    // Always pass both UID and email!
    const role = await getUserRole(verified.uid, verified.email);

    if (role === "admin" || role === "editor" || role === "support") {
      if (process.env.DEBUG_ADMIN === "true") {
        console.log("[user-role] Returning role:", role, "for", verified.email);
      }
      return NextResponse.json({ role });
    } else {
      // No explicit role found; treat as 'support'
      if (process.env.DEBUG_ADMIN === "true") {
        console.warn("[user-role] No explicit role, defaulting to support for", verified.email);
      }
      return NextResponse.json({ role: "support" });
    }
  } catch (err: unknown) {
    logError("user-role:get", err);
    if (process.env.DEBUG_ADMIN === "true") {
      console.error("[user-role] Error fetching role:", err);
    }
    // If available, surface debug info
    return NextResponse.json(
      {
        error: "Failed to fetch role",
        ...(typeof err === "object" && err !== null
          ? {
              message: (err as any).message,
              stack: (err as any).stack,
              code: (err as any).code,
            }
          : {}),
      },
      { status: 500 }
    );
  }
}

// POST: sets { uid, role } for a user; requires admin
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      if (process.env.DEBUG_ADMIN === "true") {
        console.warn("[user-role:post] Unauthorized access attempt.");
      }
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
    if (process.env.DEBUG_ADMIN === "true") {
      console.log(`[user-role:post] Set role for ${uid}: ${role}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("user-role:post", err);
    if (process.env.DEBUG_ADMIN === "true") {
      console.error("[user-role:post] Error:", err);
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
