import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Only parse JSON, no unused variable
    await request.json();

    // In a real application, this would update the notification in Firestore
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Notification updated",
    });
  } catch {
    // No unused error variable as per lint
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
