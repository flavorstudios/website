// app/api/admin/user-role/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, requireAdmin } from "@/lib/admin-auth";
import { getUserRole, setUserRole } from "@/lib/user-roles";
import { logError } from "@/lib/log";
import type { UserRole } from "@/lib/role-permissions";
import { z } from "zod";

// Zod schema for POST
const SetRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(["admin", "editor", "support"]),
});

// GET: returns { role } for the authenticated user (admin/editor/support)
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
    const verified = await verifyAdminSession(sessionCookie);
    if (process.env.DEBUG_ADMIN === "true") {
      console.log("[user-role] Verified admin:", {
        uid: verified?.uid,
        email: verified?.email,
      });
    }
    const role = await getUserRole(verified.uid, verified.email);

    if (role === "admin" || role === "editor" || role === "support") {
      if (process.env.DEBUG_ADMIN === "true") {
        console.log("[user-role] Returning role:", role, "for", verified.email);
      }
      return NextResponse.json({ role });
    } else {
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
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }
}

// POST: sets { uid, role } for a user; requires admin
export async function POST(req: NextRequest) {
  let adminUid = "unknown";
  try {
    if (!(await requireAdmin(req))) {
      if (process.env.DEBUG_ADMIN === "true") {
        console.warn("[user-role:post] Unauthorized access attempt.");
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Always get the acting admin's UID for audit/log
    const sessionCookie = req.cookies.get("admin-session")?.value;
    if (sessionCookie) {
      try {
        const verified = await verifyAdminSession(sessionCookie);
        adminUid = verified.uid;
      } catch (err) {
        logError("user-role:post:verify", err);
      }
    }
    // Parse and validate with Zod
    const body = await req.json();
    const parsed = SetRoleSchema.safeParse(body);
    if (!parsed.success) {
      logError(`user-role:post:validation admin:${adminUid}`, parsed.error);
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { uid, role } = parsed.data;
    // Role update logic
    await setUserRole(uid, role as UserRole);

    // Success audit log
    if (process.env.DEBUG_ADMIN === "true") {
      console.log(`[user-role:post] Set role for ${uid}: ${role}`);
    }
    console.log(`[user-role] Admin ${adminUid} set role for ${uid}: ${role}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("user-role:post", err);
    logError(`user-role:post admin:${adminUid}`, err);
    if (process.env.DEBUG_ADMIN === "true") {
      console.error("[user-role:post] Error:", err);
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
