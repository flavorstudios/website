import { fetchJson } from './http';

export const fetcher = <T>(url: string): Promise<T> =>
  fetchJson<T>(url, { cache: 'no-store' }, { retry: 2, timeoutMs: 15000 });