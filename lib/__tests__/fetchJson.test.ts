import { fetchJson, HttpError } from '../http';

describe('fetchJson', () => {
  beforeEach(() => {
    // @ts-expect-error - reset fetch for test control
    global.fetch = undefined;
  });

  it('returns data on success', async () => {
    // @ts-expect-error - mock fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true })
    });
    const res = await fetchJson('/api');
    expect(res).toEqual({ ok: true });
  });

  it('throws HttpError on 4xx', async () => {
    // @ts-expect-error - mock fetch 404 response
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
    // @ts-expect-error - queue mocked fetch responses for retry flow
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()));
    const res = await fetchJson('/retry', {}, { retry: 2 });
    expect(res).toEqual({ ok: true });
    // @ts-expect-error - asserting mock call count
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries on 429 and succeeds', async () => {
    const responses = [
      {
        ok: false,
        status: 429,
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
    // @ts-expect-error - mock global fetch for retry behavior
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()));
    const res = await fetchJson('/retry429', {}, { retry: 2 });
    expect(res).toEqual({ ok: true });
    // @ts-expect-error - asserting mock call count
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
    // @ts-expect-error - mock global fetch for timeout test
    global.fetch = jest.fn(() => responses.shift());
    const res = await fetchJson('/timeout', {}, { retry: 1 });
    expect(res).toEqual({ ok: true });
    // @ts-expect-error - asserting mock call count
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries on malformed json and succeeds', async () => {
    const responses = [
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => { throw new SyntaxError('bad json'); }
      },
      {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true })
      }
    ];
    // @ts-expect-error - mock global fetch for malformed JSON
    global.fetch = jest.fn(() => Promise.resolve(responses.shift()));
    const res = await fetchJson('/badjson', {}, { retry: 1 });
    expect(res).toEqual({ ok: true });
    // @ts-expect-error - asserting mock call count
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('preserves HttpError status and bodySnippet', async () => {
    // @ts-expect-error - mock global fetch for HttpError test
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      url: '/bad',
      headers: new Headers({ 'content-type': 'text/plain' }),
      clone() { return this; },
      text: async () => 'upstream error detail',
    });
    await expect(fetchJson('/bad')).rejects.toMatchObject({
      name: 'HttpError',
      status: 503,
      bodySnippet: 'upstream error detail',
    });
  });

  it('returns undefined on 204 No Content', async () => {
    // @ts-expect-error - mock global fetch for 204 test
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      text: async () => '',
    });
    const res = await fetchJson<void>('/no-content');
    expect(res).toBeUndefined();
  });
});
