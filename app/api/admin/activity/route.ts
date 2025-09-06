import { requireAdmin, getSessionInfo } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/env/server";

// GET /api/admin/activity - Only for authorized admins
export async function GET(req: NextRequest) {
  // Use the improved getSessionInfo helper
  const sessionInfo = await getSessionInfo(req);

  if (serverEnv.DEBUG_ADMIN === "true") {
    console.log("[admin-activity] Incoming request at", new Date().toISOString());
    console.log("[admin-activity] sessionInfo:", sessionInfo);
  }

  const hasAccess = await requireAdmin(req, "canViewAnalytics");

  if (serverEnv.DEBUG_ADMIN === "true") {
    console.log(
      "[admin-activity] hasAccess:",
      hasAccess,
      "| role:",
      sessionInfo?.role,
      "| email:",
      sessionInfo?.email
    );
  }

  if (!hasAccess) {
    if (serverEnv.DEBUG_ADMIN === "true") {
      console.warn("[admin-activity] ACCESS DENIED. Details:", {
        ip: req.headers.get("x-forwarded-for"),
        role: sessionInfo?.role,
        email: sessionInfo?.email,
        uid: sessionInfo?.uid,
      });
    }
    // Include the computed role, email, and uid in the error response for debugging
    return NextResponse.json(
      {
        error: "Unauthorized",
        role: sessionInfo?.role || "unknown",
        email: sessionInfo?.email || "unknown",
        uid: sessionInfo?.uid || "unknown",
      },
      { status: 401 }
    );
  }

  try {
    // ✅ Fallback: if Firestore isn't configured, return empty list (prevents 5xx)
    if (!adminDb) {
      return NextResponse.json({ activities: [] }, { status: 200 });
    }

    // 🔥 Real Firestore query for activity log, most recent first
    const snap = await adminDb
      .collection("activityLog")
      .orderBy("timestamp", "desc")
      .get();

    const activities = snap.docs.map((doc) => {
      const data = doc.data() as {
        type?: string;
        title?: string;
        description?: string;
        status?: string;
        action?: string;
        user?: string;
        timestamp?: { toDate(): Date } | string;
      };
      const type = data.type || data.action || "info";
      const title = data.title || data.action || "Untitled";
      const description =
        data.description ||
        (data.user ? `Performed by ${data.user}` : "");
      const status = data.status || "unknown";
      const timestamp =
        typeof data.timestamp === "string"
          ? data.timestamp
          : data.timestamp?.toDate().toISOString();
      return { id: doc.id, type, title, description, status, timestamp };
    });

    const payload = {
      activities,
      success: true,
    };

    if (serverEnv.DEBUG_ADMIN === "true") {
      console.log("[admin-activity] Returning payload:", payload);
    }
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
