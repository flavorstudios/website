import { fetchJson } from './http';

export const fetcher = (url: string) =>
  fetchJson(url, { cache: 'no-store' }, { retry: 2, timeoutMs: 15000 });
