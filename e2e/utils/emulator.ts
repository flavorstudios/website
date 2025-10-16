import { readFileSync } from "node:fs";
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

  if (host === "localhost") {
    host = "127.0.0.1";
  }

  return {
    host,
    port,
  };
}

export function getProjectId() {
  const envProject =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT;
  if (envProject) {
    return envProject;
  }

  try {
    const firebaseRc = JSON.parse(readFileSync(".firebaserc", "utf8"));
    const projectId = firebaseRc?.projects?.default;
    if (projectId) {
      return projectId;
    }
  } catch {
    /* ignore, we'll throw below */
  }

  throw new Error(
    "Cannot determine Firebase project ID. Set FIREBASE_PROJECT_ID or ensure .firebaserc exists.",
  );
}

export function ensureReachable(host: string, port: number, name: string) {
  return new Promise<void>((resolve, reject) => {
    const socket = new Socket();
    const fail = (err: Error | string) => {
      socket.destroy();
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