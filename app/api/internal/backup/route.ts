import { handleCron } from "@/lib/cron";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { adminDb } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function exportFirestore(dbFile: string): Promise<void> {
  if (!adminDb) {
    await fs.writeFile(dbFile, "{}");
    return;
  }

  const data: Record<string, unknown> = {};
  try {
    const collections = await adminDb.listCollections();
    for (const col of collections) {
      const snap = await col.get();
      data[col.id] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    await fs.writeFile(dbFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Firestore export failed", err);
    await fs.writeFile(dbFile, "{}");
    throw err;
  }
}

async function exportStorage(storageFile: string): Promise<void> {
  if (!adminDb) {
    await fs.writeFile(storageFile, "");
    return;
  }

  const bucket = getStorage().bucket();
  const tmpRoot = await fs.mkdtemp(join(tmpdir(), "storage-"));
  try {
    const [files] = await bucket.getFiles();
    await Promise.all(
      files.map(async (file) => {
        const dest = join(tmpRoot, file.name);
        await fs.mkdir(dirname(dest), { recursive: true });
        await file.download({ destination: dest });
      })
    );
    await execFileAsync("tar", ["-cf", storageFile, "-C", tmpRoot, "."]);
  } catch (err) {
    console.error("Storage export failed", err);
    await fs.writeFile(storageFile, "");
    throw err;
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
}

async function rotateBackups(dir: string, keep: number): Promise<void> {
  const entries = await fs.readdir(dir);
  const groups: Record<string, string[]> = {};
  for (const file of entries) {
    const match = file.match(/^(db|storage)-(.*)\.(json|tar)$/);
    if (match) {
      const ts = match[2];
      groups[ts] = groups[ts] || [];
      groups[ts].push(file);
    }
  }
  const timestamps = Object.keys(groups).sort();
  while (timestamps.length > keep) {
    const ts = timestamps.shift();
    if (ts) {
      for (const f of groups[ts]) {
        await fs.unlink(join(dir, f));
      }
    }
  }
}

// Requires BACKUP_DIR and GOOGLE_APPLICATION_CREDENTIALS environment variables.
// BACKUP_DIR: writable directory where backup artifacts will be written.
// GOOGLE_APPLICATION_CREDENTIALS: service account JSON used for privileged export.

export async function POST(req: Request) {
  return handleCron("backup", req, async () => {
    const backupDir = process.env.BACKUP_DIR;
    const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!backupDir || !creds) {
      throw new Error("Missing BACKUP_DIR or GOOGLE_APPLICATION_CREDENTIALS env vars");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dbFile = join(backupDir, `db-${timestamp}.json`);
    const storageFile = join(backupDir, `storage-${timestamp}.tar`);

    try {
      await exportFirestore(dbFile);
      await exportStorage(storageFile);
      const retention = parseInt(process.env.BACKUP_RETENTION || "5", 10);
      await rotateBackups(backupDir, retention);
    } catch (err) {
      console.error("Backup failed", err);
      throw err;
    }

    return { artifacts: [dbFile, storageFile] };
  });
}