const LOCAL_FALLBACK = "http://127.0.0.1:3000";

function coalesceBaseUrl(): string {
  return (
    process.env.E2E_BASE_URL ??
    process.env.PLAYWRIGHT_BASE_URL ??
    process.env.BASE_URL ??
    LOCAL_FALLBACK
  );
}

export function getBaseUrl(): string {
  return coalesceBaseUrl();
}

export function getBaseHostname(override?: string): string {
  const source = override ?? coalesceBaseUrl();
  try {
    const url = new URL(source);
    return url.hostname || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}