'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HttpError } from '@/lib/http';

export interface DashboardStats {
  totalPosts: number;
  totalVideos: number;
  totalComments: number;
  totalViews: number;
  pendingComments: number;
  publishedPosts: number;
  featuredVideos: number;
  monthlyGrowth: number;
  history?: {
    month: string;
    posts: number;
    videos: number;
    comments: number;
  }[];
}

let etag: string | undefined;

export function useDashboardStats(live = false, enabled = true) {
  const queryClient = useQueryClient();
  return useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats?range=12mo', {
        headers: etag ? { 'If-None-Match': etag } : undefined,
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.status === 304) {
        const cached = queryClient.getQueryData<DashboardStats>(['dashboard']);
        if (!cached) throw new HttpError('Not Modified', 304, '/api/admin/stats');
        return cached;
      }
      if (!res.ok) throw new HttpError('Failed to load', res.status, '/api/admin/stats');
      etag = res.headers.get('etag') || undefined;
      return (await res.json()) as DashboardStats;
    },
    retry: 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: live ? 15_000 : 60_000,
    refetchIntervalInBackground: false,
    enabled,
  });
}