import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";
import { FieldValue } from "firebase-admin/firestore";

export interface ActivityLogEntry {
  type: string;
  title: string;
  description?: string;
  status?: string;
  user?: string;
  timestamp?: FieldValue;
}

/**
 * Writes an activity entry to the Firestore `activityLog` collection.
 * Silently skips if `adminDb` is not available.
 */
export async function logActivity({
  type,
  title,
  description = "",
  status = "success",
  user = "system",
  timestamp,
}: ActivityLogEntry): Promise<void> {
  try {
    if (!adminDb) return;
    await adminDb.collection("activityLog").add({
      type,
      title,
      description,
      status,
      user,
      timestamp: timestamp ?? FieldValue.serverTimestamp(),
    });
  } catch (err) {
    logError("activity-log", err);
  }
}