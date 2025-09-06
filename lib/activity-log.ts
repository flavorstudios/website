import { adminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

export interface ActivityLogEntry {
  type: string;
  title: string;
  description?: string;
  status?: string;
  user?: string;
  timestamp?: string;
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
  timestamp = new Date().toISOString(),
}: ActivityLogEntry): Promise<void> {
  try {
    if (!adminDb) return;
    await adminDb.collection("activityLog").add({
      type,
      title,
      description,
      status,
      user,
      timestamp,
    });
  } catch (err) {
    logError("activity-log", err);
  }
}