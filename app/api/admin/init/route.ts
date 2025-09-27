import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest, NextResponse } from "next/server";
import { initializeHomeStats } from "@/lib/sample-data";
import { isAdminSdkAvailable } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminSdkAvailable()) {
    logger.debug(
      "[Admin Init] Skipping stats initialization: Firebase Admin SDK unavailable."
    );
    return NextResponse.json({
      success: true,
      message: "Admin SDK unavailable; skipping stats initialization.",
    });
  }
  try {
    await initializeHomeStats();
    return NextResponse.json({
      success: true,
      message: "Site stats initialized successfully (no sample content created).",
    });
  } catch {
    return NextResponse.json({ error: "Failed to initialize data" }, { status: 500 });
  }
}
