#!/usr/bin/env ts-node
import { getAdminDb } from '@/lib/firebase-admin';
import { deleteMedia } from '@/lib/media';
import { serverEnv } from '@/env/server';
import { getStorage } from 'firebase-admin/storage';

const SAMPLE_MEDIA_NAMES = new Set([
  'Episode 7 Key Art',
  'Second Media Item',
]);

const SAMPLE_DOC_IDS = ['e2e-media-1', 'e2e-media-2'];
const STORAGE_PREFIXES = ['media/e2e/', 'media/test/'];

function parseAllowlist(): Set<string> {
  const raw = process.env.MEDIA_CLEANUP_ALLOWLIST ?? '';
  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

function resolveProjectId(): string | undefined {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    return process.env.GOOGLE_CLOUD_PROJECT;
  }

  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ??
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson) as { project_id?: string };
      if (parsed.project_id) {
        return parsed.project_id;
      }
    } catch (error) {
      console.warn('[cleanupTestMedia] Failed to parse service account JSON:', error);
    }
  }

  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    serverEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    undefined
  );
}

async function collectMediaIds(): Promise<Set<string>> {
  const db = getAdminDb();
  const ids = new Set<string>();
  const collection = db.collection('media');

  const flagSnapshot = await collection.where('test', '==', true).get();
  flagSnapshot.forEach((doc) => ids.add(doc.id));

  for (const name of SAMPLE_MEDIA_NAMES) {
    const snapshot = await collection.where('name', '==', name).get();
    snapshot.forEach((doc) => ids.add(doc.id));
  }

  await Promise.all(
    SAMPLE_DOC_IDS.map(async (docId) => {
      const doc = await collection.doc(docId).get();
      if (doc.exists) {
        ids.add(doc.id);
      }
    }),
  );

  return ids;
}

async function cleanupStorage(): Promise<void> {
  try {
    const bucket = getStorage().bucket();
    await Promise.all(
      STORAGE_PREFIXES.map(async (prefix) => {
        try {
          await bucket.deleteFiles({ prefix, force: true });
          console.log(`[cleanupTestMedia] Deleted storage objects under ${prefix}`);
        } catch (error) {
          console.warn(
            `[cleanupTestMedia] Failed to delete storage objects for ${prefix}:`,
            error,
          );
        }
      }),
    );
  } catch (error) {
    console.warn('[cleanupTestMedia] Storage bucket unavailable; skipping storage cleanup.', error);
  }
}

async function main() {
  const allowlist = parseAllowlist();
  const projectId = resolveProjectId();

  if (!projectId) {
    console.log('[cleanupTestMedia] Skipping: unable to determine project id.');
    return;
  }

  if (!allowlist.has(projectId)) {
    console.log(
      `[cleanupTestMedia] Skipping: project ${projectId} is not in MEDIA_CLEANUP_ALLOWLIST.`,
    );
    return;
  }

  let mediaIds: Set<string>;
  try {
    mediaIds = await collectMediaIds();
  } catch (error) {
    console.error('[cleanupTestMedia] Failed to query media collection:', error);
    process.exitCode = 1;
    return;
  }

  if (mediaIds.size === 0) {
    console.log('[cleanupTestMedia] No test media documents found.');
  } else {
    console.log(
      `[cleanupTestMedia] Deleting ${mediaIds.size} media document(s): ${Array.from(mediaIds).join(', ')}`,
    );
    for (const id of mediaIds) {
      try {
        await deleteMedia(id, true);
      } catch (error) {
        console.warn(`[cleanupTestMedia] Failed to delete media ${id}:`, error);
        process.exitCode = 1;
      }
    }
  }

  await cleanupStorage();
}

main().catch((error) => {
  console.error('[cleanupTestMedia] Unexpected error:', error);
  process.exitCode = 1;
});