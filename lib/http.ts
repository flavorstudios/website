export class HttpError extends Error {
  status: number; // 0 for client/parse errors that may be retryable
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

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  opts: { retry?: number; timeoutMs?: number } = {}
): Promise<T> {
  const retry = opts.retry ?? 0;
  const timeoutMs = opts.timeoutMs ?? 15000;

  const attemptOnce = async (): Promise<T> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const headers = new Headers(init.headers ?? undefined);
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }

      const res = await fetch(input, {
        ...init,
        credentials: init.credentials ?? 'include',
        headers,
        signal: ctrl.signal,
      });

      const urlText = res.url || (typeof input === 'string' ? input : String(input));
      const ct = (res.headers.get('content-type') || '').toLowerCase();

      if (!res.ok) {
        let bodySnippet = '';
        try {
          const clone = res.clone();
          bodySnippet = ct.includes('application/json')
            ? JSON.stringify(await clone.json()).slice(0, 200)
            : (await clone.text()).slice(0, 200);
        } catch {
          // ignore body read errors for snippet
        }
        throw new HttpError(`HTTP ${res.status} for ${urlText}`, res.status, urlText, bodySnippet);
      }

      // Success path
      if (ct.includes('application/json')) {
        try {
          return (await res.json()) as T;
        } catch {
          // Invalid JSON on a 2xx response
          throw new HttpError(`Invalid JSON for ${urlText}`, 0, urlText);
        }
      }

      // Allow empty bodies to resolve to undefined
      if (res.status === 204) {
        return undefined as unknown as T;
      }
      const text = await res.text();
      if (text.trim() === '') {
        return undefined as unknown as T;
      }

      // Unexpected non-JSON content on success
      throw new HttpError(`Expected JSON for ${urlText}`, 0, urlText, text.slice(0, 200));
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Normalize timeouts for consistent handling/tests
        throw new Error('Request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };

  // Exponential backoff with jitter; retry on 5xx, 429, network/timeout, and parse errors (status 0/undefined)
  for (let attempt = 0; ; attempt++) {
    try {
      return await attemptOnce();
    } catch (err) {
      const status = (err as { status?: number } | undefined)?.status;
      const message = (err as Error).message || '';
      const isTimeout = message.includes('timed out');

      const retryable =
        isTimeout ||
        status === undefined || // e.g., network error from fetch
        status === 0 ||         // client/parse error we marked as retryable
        status === 429 ||
        (typeof status === 'number' && status >= 500);

      if (attempt < retry && retryable) {
        const backoff = Math.min(500 * 2 ** attempt, 5000);
        const jitter = Math.floor(Math.random() * 100);
        await new Promise((r) => setTimeout(r, backoff + jitter));
        continue;
      }
      throw err;
    }
  }
}
