import { fetchJson, HttpError } from '../http';

describe('fetchJson', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = undefined;
  });

  it('returns data on success', async () => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true })
    });
    const res = await fetchJson('/api');
    expect(res).toEqual({ ok: true });
  });

  it('throws HttpError on 4xx', async () => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      clone() { return this; },
      json: async () => ({ message: 'not found' }),
      text: async () => ''
    });
    await expect(fetchJson('/missing')).rejects.toBeInstanceOf(HttpError);
  });

  it('retries on 5xx and succeeds', async () => {
    const responses = [
      {
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        clone() { return this; },
        json: async () => ({}),
        text: async () => ''
      },
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true })
      }
    ];
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()));
    const res = await fetchJson('/retry', {}, { retry: 2 });
    expect(res).toEqual({ ok: true });
    // @ts-ignore
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});