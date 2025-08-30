import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

export async function POST(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  if (!(await requireAdmin(req, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let action: string;
  try {
    ({ action } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!uid || !action) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    if (!user.email) {
      return NextResponse.json({ error: "User has no email" }, { status: 400 });
    }

    if (action === "verify") {
      const link = await auth.generateEmailVerificationLink(user.email);
      return NextResponse.json({ link });
    }

    if (action === "reset") {
      const link = await auth.generatePasswordResetLink(user.email);
      return NextResponse.json({ link });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    logError("admin-users:actions", err);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
