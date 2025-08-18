import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDashboardStats } from './useDashboardStats';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

test('returns dashboard stats', async () => {
  global.fetch = jest.fn().mockResolvedValue({
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
    headers: new Headers(),
  }) as any;
  const { result } = renderHook(() => useDashboardStats(), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.totalPosts).toBe(1);
});