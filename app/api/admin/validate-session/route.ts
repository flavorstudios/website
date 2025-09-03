// app/api/admin/validate-session/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logError } from "@/lib/log"; // Consistent server logging
import { serverEnv } from "@/env/server";

// Enable deep debug logging if DEBUG_ADMIN is set (or in dev)
const debug = serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV !== "production";

export async function GET(req: NextRequest) {
  try {
    const ok = await requireAdmin(req);
    if (!ok) {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log("[validate-session] Unauthorized request");
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("validate-session", err);
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[validate-session] Session validation failed:", err);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
