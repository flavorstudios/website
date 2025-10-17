import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

function resolveProjectRoot() {
  return path.resolve(repoRoot, "../..");
}

function resolveAuthDir() {
  return path.join(resolveProjectRoot(), "e2e", ".auth");
}

function resolveStoragePath() {
  return path.join(resolveAuthDir(), "admin.json");
}

function parseDomainFromBaseUrl(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    return url.hostname || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function buildCookie(domain: string) {
  return {
    name: "e2e-admin",
    value: "true",
    domain,
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
    expires: -1,
  };
}

export async function ensureAdminAuthState(baseUrl?: string) {
  const domain = parseDomainFromBaseUrl(
    baseUrl ?? process.env.BASE_URL ?? "http://127.0.0.1:3000"
  );

  const authDir = resolveAuthDir();
  await mkdir(authDir, { recursive: true });

  const cookies = [buildCookie(domain)];
  if (domain !== "localhost") {
    cookies.push(buildCookie("localhost"));
  }

  const storageState = {
    cookies,
    origins: [] as unknown[],
  };

  const storagePath = resolveStoragePath();
  await writeFile(storagePath, JSON.stringify(storageState, null, 2));

  return storagePath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ensureAdminAuthState(process.argv[2])
    .then((storagePath) => {
      console.log(`Admin storage state written to ${storagePath}`);
    })
    .catch((error) => {
      console.error("Failed to create admin auth state", error);
      process.exitCode = 1;
    });
}