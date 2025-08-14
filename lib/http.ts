export class HttpError extends Error {
  status: number;
  url: string;
  bodySnippet?: string;
  constructor(msg: string, status: number, url: string, bodySnippet?: string) {
    super(msg);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.bodySnippet = bodySnippet;
  }
}

function withTimeout<T>(p: Promise<T>, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  p.catch(() => {});
  return {
    signal: ctrl.signal,
    run: (fn: (signal: AbortSignal) => Promise<T>) =>
      Promise.race([
        fn(ctrl.signal),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Request timed out')), ms)),
      ]).finally(() => clearTimeout(t)),
  };
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { retry = 0 }: { retry?: number } = {}
): Promise<T> {
  const attempt = async (): Promise<T> => {
    const { signal, run } = withTimeout(Promise.resolve(), 15000);
    const res = await run(() =>
      fetch(input, {
        credentials: 'include',
        headers: { Accept: 'application/json', ...(init.headers || {}) },
        ...init,
        signal,
      })
    );

    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      let bodySnippet = '';
      try {
        if (ct.includes('application/json')) {
          bodySnippet = JSON.stringify(await res.clone().json()).slice(0, 200);
        } else {
          bodySnippet = (await res.clone().text()).slice(0, 200);
        }
      } catch {}
      throw new HttpError(`HTTP ${res.status} for ${res.url}`, res.status, res.url, bodySnippet);
    }

    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return (await res.json()) as T;
    return undefined as unknown as T;
  };

  try {
    return await attempt();
  } catch (err) {
    const status = (err as { status?: number } | undefined)?.status;
    if (retry > 0 && (status === 429 || status === 503)) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchJson<T>(input, init, { retry: retry - 1 });
    }
    throw err;
  }
}