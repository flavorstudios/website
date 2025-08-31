import { fetchJson, HttpError } from '../http';

const originalFetch = global.fetch;

describe('fetchJson', () => {
  beforeEach(() => {
    global.fetch = undefined as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns data on success', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true }),
      } as Response);
    const res = await fetchJson('/api');
    expect(res).toEqual({ ok: true });
  });

  it('throws HttpError on 4xx', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        clone() {
          return this;
        },
        json: async () => ({ message: 'not found' }),
        text: async () => '',
      } as Response);
    await expect(fetchJson('/missing')).rejects.toBeInstanceOf(HttpError);
  });

  it('retries on 5xx and succeeds', async () => {
    const responses: Response[] = [
      {
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        clone() {
          return this;
        },
        json: async () => ({}),
        text: async () => '',
      } as Response,
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true }),
      } as Response,
    ];
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()!));
    const res = await fetchJson('/retry', {}, { retry: 2 });
    expect(res).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries on 429 and succeeds', async () => {
    const responses: Response[] = [
      {
        ok: false,
        status: 429,
        headers: new Headers({ 'content-type': 'application/json' }),
        clone() {
          return this;
        },
        json: async () => ({}),
        text: async () => '',
      } as Response,
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true }),
      } as Response,
    ];
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()!));
    const res = await fetchJson('/retry429', {}, { retry: 2 });
    expect(res).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries on timeout and succeeds', async () => {
    const responses: Array<Promise<Response>> = [
      Promise.reject(new Error('Request timed out')) as Promise<Response>,
      Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true })
      } as Response)
    ];
    global.fetch = jest.fn(() => responses.shift()!);
    const res = await fetchJson('/timeout', {}, { retry: 1 });
    expect(res).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries on malformed json and succeeds', async () => {
    const responses: Response[] = [
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => {
          throw new SyntaxError('bad json');
        },
      } as Response,
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true }),
      } as Response,
    ];
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()!));
    const res = await fetchJson('/badjson', {}, { retry: 1 });
    expect(res).toEqual({ ok: true });
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 503,
        url: '/bad',
        headers: new Headers({ 'content-type': 'text/plain' }),
        clone() {
          return this;
        },
        text: async () => 'upstream error detail',
      } as Response);
    await expect(fetchJson('/bad')).rejects.toMatchObject({
      name: 'HttpError',
      status: 503,
      bodySnippet: 'upstream error detail',
    });
  });

  it('returns undefined on 204 No Content', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      } as Response);
    const res = await fetchJson<void>('/no-content');
    expect(res).toBeUndefined();
  });
});
