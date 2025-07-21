import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { userRoleStore } from "@/lib/user-role-store";
import { requireAdmin } from "@/lib/admin-auth";
import { logError } from "@/lib/log";
import type { UserRole } from "@/lib/role-permissions";

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionCookie = req.cookies.get("admin-session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const role = (await userRoleStore.get(decoded.uid)) || ("admin" as UserRole);
    return NextResponse.json({ role });
  } catch (err) {
    logError("user-role:get", err);
    return NextResponse.json({ role: "support" }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { uid, role } = await req.json();
    if (!uid || !role) {
      return NextResponse.json({ error: "Missing uid or role" }, { status: 400 });
    }
    await userRoleStore.set(uid, role as UserRole);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("user-role:post", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
