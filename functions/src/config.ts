import * as admin from "firebase-admin";

// Initialize only if there isn't already an app instance
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
