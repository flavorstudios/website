import { useCallback, useEffect, useRef, useState } from "react";
import { openDB } from "idb";

export type AutosaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "offline"
  | "error"
  | "conflict";

interface AutosaveOptions<T> {
  draftId: string;
  data: T;
}

// simple key helpers for IndexedDB
const dbPromise = openDB("autosave", 1, {
  upgrade(db) {
    db.createObjectStore("drafts");
  },
});

async function idbSet(key: string, val: unknown) {
  const db = await dbPromise;
  return db.put("drafts", val, key);
}
async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await dbPromise;
  return db.get("drafts", key);
}
async function idbDel(key: string) {
  const db = await dbPromise;
  return db.delete("drafts", key);
}

export function useAutosave<T>({ draftId, data }: AutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [version, setVersion] = useState<number | undefined>();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const tokenRef = useRef<symbol | null>(null);
  const retryRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout>();

  const key = `draft:${draftId}`;

  const save = useCallback(
    async (payload: T = data, v: number | undefined = version) => {
      if (!navigator.onLine) {
        await idbSet(key, { payload, version: v, ts: Date.now() });
        setStatus("offline");
        return;
      }

      setStatus("saving");
      const token = Symbol("req");
      tokenRef.current = token;
      try {
        const res = await fetch("/api/admin/blog/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, draftId, version: v }),
        });
        if (tokenRef.current !== token) return;
        if (res.ok) {
          const json = await res.json();
          setVersion(json.version);
          setSavedAt(new Date(json.savedAtISO));
          await idbDel(key);
          setStatus("saved");
          retryRef.current = 0;
        } else if (res.status === 409) {
          setStatus("conflict");
          const json = await res.json();
          await idbSet(key, { payload, version: v, ts: Date.now(), server: json.server });
        } else {
          await idbSet(key, { payload, version: v, ts: Date.now() });
          setStatus("error");
          retryRef.current += 1;
          const delay = Math.min(30000, 1000 * 2 ** retryRef.current);
          setTimeout(() => void save(payload, v), delay);
        }
      } catch {
        await idbSet(key, { payload, version: v, ts: Date.now() });
        setStatus("error");
        retryRef.current += 1;
        const delay = Math.min(30000, 1000 * 2 ** retryRef.current);
        setTimeout(() => void save(payload, v), delay);
      }
    },
    [data, draftId, key, version]
  );

  // debounce changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void save();
    }, 1000);
    return () => clearTimeout(debounceRef.current);
  }, [save, data]);

  // sync local draft on mount and listen for online events
  useEffect(() => {
    const syncLocal = async () => {
      const local = await idbGet<any>(key);
      if (local) {
        await save(local.payload, local.version);
      }
    };
    void syncLocal();

    const onOnline = () => {
      void syncLocal();
    };
    const onOffline = () => setStatus("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [key, save]);

  return { status, savedAt };
}