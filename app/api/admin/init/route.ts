import { requireAdmin } from "@/lib/admin-auth";
import { type NextRequest } from "next/server";
import { initializeHomeStats } from "@/lib/sample-data";
import { isAdminSdkAvailable } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);
  if (!(await requireAdmin(request))) {
    return errorResponse(context, { error: "Unauthorized" }, 401);
  }
  if (!isAdminSdkAvailable()) {
    logger.debug(
      "[Admin Init] Skipping stats initialization: Firebase Admin SDK unavailable."
    );
    return jsonResponse(context, {
      success: true,
      message: "Admin SDK unavailable; skipping stats initialization.",
    });
  }
  try {
    await initializeHomeStats();
    return jsonResponse(context, {
      success: true,
      message: "Site stats initialized successfully (no sample content created).",
    });
  } catch {
    return errorResponse(context, { error: "Failed to initialize data" }, 500);
  }
}
