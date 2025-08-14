// Only import this from a dev-only entrypoint like app/layout.tsx when process.env.NODE_ENV === 'development'
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== 'undefined' && !(window as any).__FETCH_LOGGER__) {
  (window as any).__FETCH_LOGGER__ = true;
  const orig = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const res = await orig(input, init);
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const clone = res.clone();
        let bodySnippet = '';
        try {
          bodySnippet = ct.includes('application/json')
            ? JSON.stringify(await clone.json()).slice(0, 200)
            : (await clone.text()).slice(0, 200);
        } catch {}
        console.warn('[fetch:error]', {
          url: typeof input === 'string' ? input : input.toString(),
          status: res.status,
          statusText: res.statusText,
          contentType: ct,
          bodySnippet,
        });
      }
      return res;
    } catch (err) {
      console.error('[fetch:network-error]', {
        url: typeof input === 'string' ? input : input.toString(),
        err,
      });
      throw err;
    }
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
