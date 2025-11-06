import { type NextRequest, NextResponse } from "next/server";

import { getSessionInfo, isAdmin } from "@/lib/admin-auth";
import { ADMIN_BYPASS, adminDb } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/activity-log";
import { logError } from "@/lib/log";
import {
  DEFAULT_APPEARANCE,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PROFILE,
  mergeSettings,
} from "@/lib/settings/common";
import { userSettingsSchema, type UserSettings } from "@/lib/schemas/settings";

function cloneDefaultSettings(): UserSettings {
  return {
    profile: { ...DEFAULT_PROFILE },
    notifications: JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS)) as UserSettings["notifications"],
    appearance: { ...DEFAULT_APPEARANCE },
    updatedAt: Date.now(),
  };
}

function normalizeSettings(data: unknown): UserSettings {
  const candidate =
    typeof data === "object" && data !== null ? (data as Partial<UserSettings>) : {};
  const merged = mergeSettings(cloneDefaultSettings(), candidate);
  const sanitized = {
    ...merged,
    updatedAt: typeof merged.updatedAt === "number" ? merged.updatedAt : Date.now(),
  };
  const parsed = userSettingsSchema.safeParse(sanitized);
  if (parsed.success) {
    return parsed.data;
  }
  throw new Error(parsed.error.message);
}

function adminDbUnavailableResponse() {
  return NextResponse.json(
    { error: "Admin settings unavailable", code: "ADMIN_SDK_UNAVAILABLE" },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  const session = await getSessionInfo(request);
  const email = session?.email ?? null;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Email not on admin list" }, { status: 401 });
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    if (ADMIN_BYPASS) {
      return NextResponse.json({ settings: cloneDefaultSettings() });
    }
    logError("admin-settings:api:get:adminDb", new Error("Admin Firestore unavailable"));
    return adminDbUnavailableResponse();
  }

  try {
    const snapshot = await adminDb
      .collection("adminSettings")
      .doc(session.uid)
      .get();
    const settings = normalizeSettings(snapshot.exists ? snapshot.data() : undefined);
    return NextResponse.json({ settings });
  } catch (error) {
    logError("admin-settings:api:get", error, { uid: session.uid });
    return NextResponse.json(
      { error: "Failed to fetch settings", code: "FIRESTORE_ERROR" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionInfo(request);
  const email = session?.email ?? null;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Email not on admin list" }, { status: 401 });
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    if (ADMIN_BYPASS) {
      return NextResponse.json({ settings: cloneDefaultSettings() });
    }
    logError("admin-settings:api:post:adminDb", new Error("Admin Firestore unavailable"));
    return adminDbUnavailableResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    logError("admin-settings:api:parse", error);
    return NextResponse.json(
      { error: "Invalid settings payload", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  const parsed = userSettingsSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings payload", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }
  try {
    await adminDb
      .collection("adminSettings")
      .doc(session.uid)
      .set(parsed.data, { merge: true });

    const snapshot = await adminDb
      .collection("adminSettings")
      .doc(session.uid)
      .get();
    const settings = normalizeSettings(snapshot.exists ? snapshot.data() : parsed.data);

    try {
      await logActivity({
        type: "settings.update",
        title: "Admin settings",
        description: "Updated admin settings",
        status: "success",
        user: session.email || session.uid,
      });
    } catch (activityError) {
      logError("admin-settings:api:activity", activityError);
    }

    return NextResponse.json({ settings });
  } catch (error) {
    logError("admin-settings:api:save", error, { uid: session.uid });
    return NextResponse.json(
      { error: "Failed to save settings", code: "FIRESTORE_ERROR" },
      { status: 500 },
    );
  }
}