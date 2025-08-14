import { fetchJson } from './http';

export const fetcher = (url: string) => fetchJson(url);