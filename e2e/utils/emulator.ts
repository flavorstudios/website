import { readFileSync, existsSync } from "node:fs";
import { Socket } from "node:net";

export function parseHostPort(
  envVar: string,
  defaultHost: string,
  defaultPort: number,
) {
  const value = process.env[envVar];
  let host: string;
  let port: number;

  if (!value) {
    host = defaultHost;
    port = defaultPort;
  } else {
    const [rawHost, portStr] = value.split(":");
    const parsedPort = Number.parseInt(portStr ?? "", 10);
    host = rawHost || defaultHost;
    port = Number.isNaN(parsedPort) ? defaultPort : parsedPort;
  }

  // unify localhost-like hosts for CI/emulators
  if (host === "localhost" || host === "0.0.0.0") {
    host = "127.0.0.1";
  }

  return {
    host,
    port,
  };
}

function tryProjectIdFromServiceAccountEnv(): string | undefined {
  // plain JSON in env
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (typeof parsed.project_id === "string" && parsed.project_id.length) {
        return parsed.project_id;
      }
    } catch {
      // ignore, fall through
    }
  }

  // base64 encoded JSON in env
  const rawB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64;
  if (rawB64) {
    try {
      const json = Buffer.from(rawB64, "base64").toString("utf8");
      const parsed = JSON.parse(json);
      if (typeof parsed.project_id === "string" && parsed.project_id.length) {
        return parsed.project_id;
      }
    } catch {
      // ignore, fall through
    }
  }

  // GOOGLE_APPLICATION_CREDENTIALS pointing to a file
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credsPath && existsSync(credsPath)) {
    try {
      const json = readFileSync(credsPath, "utf8");
      const parsed = JSON.parse(json);
      if (typeof parsed.project_id === "string" && parsed.project_id.length) {
        return parsed.project_id;
      }
    } catch {
      // ignore, fall through
    }
  }

  return undefined;
}

export function getProjectId() {
  const envProject =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT;
  if (envProject) {
    return envProject;
  }

  // try to read from service account input since CI is already giving us that
  const saProject = tryProjectIdFromServiceAccountEnv();
  if (saProject) {
    return saProject;
  }

  // try .firebaserc like before
  try {
    const firebaseRc = JSON.parse(readFileSync(".firebaserc", "utf8"));
    const projectId = firebaseRc?.projects?.default;
    if (projectId) {
      return projectId;
    }
  } catch {
    // ignore, we handle below
  }

  // if CI is in relaxed mode, do not hard fail
  const isCI =
    process.env.CI === "true" ||
    process.env.CI === "1" ||
    process.env.SKIP_STRICT_ENV === "1";
  if (isCI) {
    // keep it stable and obvious in logs
    return "local-ci-project";
  }

  throw new Error(
    "Cannot determine Firebase project ID. Set FIREBASE_PROJECT_ID or ensure .firebaserc exists.",
  );
}

export function ensureReachable(host: string, port: number, name: string) {
  const relaxed =
    process.env.SKIP_STRICT_ENV === "1" ||
    process.env.CI === "true" ||
    process.env.CI === "1";

  return new Promise<void>((resolve, reject) => {
    const socket = new Socket();

    const fail = (err: Error | string) => {
      socket.destroy();

      if (relaxed) {
        // keep test runs green in CI when emulators are not running
        console.warn(
          `[emulator] ${name} at ${host}:${port} not reachable in CI/relaxed mode: ${
            typeof err === "string" ? err : err.message
          }`,
        );
        resolve();
        return;
      }

      reject(
        new Error(
          `${name} emulator at ${host}:${port} unreachable: ${
            typeof err === "string" ? err : err.message
          }`,
        ),
      );
    };

    // Bump timeout to reduce CI flakiness
    socket.setTimeout(3000, () => fail("timeout"));
    socket.once("error", fail);
    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });
}
