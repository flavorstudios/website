import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDashboardStats } from './useDashboardStats';

const client = new QueryClient();
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

test('fetches dashboard stats for multiple ranges', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        totalPosts: 1,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
      }),
      headers: new Headers({ etag: 'etag-12' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        totalPosts: 2,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
      }),
      headers: new Headers({ etag: 'etag-6' }),
    })
    .mockResolvedValueOnce({
      ok: false,
      status: 304,
      headers: new Headers(),
    });

  global.fetch = fetchMock as any;

  const { result: range12 } = renderHook(
    () => useDashboardStats(false, true, '12mo'),
    { wrapper }
  );
  await waitFor(() => expect(range12.current.isSuccess).toBe(true));

  const { result: range6 } = renderHook(
    () => useDashboardStats(false, true, '6mo'),
    { wrapper }
  );
  await waitFor(() => expect(range6.current.isSuccess).toBe(true));

  await range12.current.refetch();
  await waitFor(() => expect(range12.current.isSuccess).toBe(true));

  expect(range12.current.data?.totalPosts).toBe(1);
  expect(range6.current.data?.totalPosts).toBe(2);

  expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/stats?range=12mo');
  expect(fetchMock.mock.calls[0][1]?.headers).toBeUndefined();
  expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/stats?range=6mo');
  expect(fetchMock.mock.calls[1][1]?.headers).toBeUndefined();
  expect(fetchMock.mock.calls[2][0]).toBe('/api/admin/stats?range=12mo');
  expect(fetchMock.mock.calls[2][1]?.headers).toEqual({
    'If-None-Match': 'etag-12',
  });
});