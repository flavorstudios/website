// app/api/admin/validate-session/route.ts

import { type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logError, logBreadcrumb } from "@/lib/log"; // Consistent server logging
import { serverEnv } from "@/env/server";
import {
  createRequestContext,
  errorResponse,
  jsonResponse,
} from "@/lib/api/response";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV !== "production";

export async function GET(req: NextRequest) {
  const context = createRequestContext(req);
  try {
    const ok = await requireAdmin(req);
    if (!ok) {
      if (debug) {
        logBreadcrumb("validate-session: unauthorized");
      }
      logBreadcrumb("validate-session: unauthorized", {
          requestId: context.requestId,
        });
    }

    return jsonResponse(context, { ok: true });
  } catch (err) {
    logError("validate-session", err, { requestId: context.requestId });
    if (debug) {
      logBreadcrumb("validate-session: failure", {
        requestId: context.requestId,
      });
    }
    return errorResponse(context, { error: "Unauthorized" }, 401);
  }
}
