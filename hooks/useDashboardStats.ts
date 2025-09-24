'use client';

import { useRef } from 'react';
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

const etags: Record<string, string | undefined> = {};

export function useDashboardStats(live = false, enabled = true, range = '12mo') {
  const queryClient = useQueryClient();
  const lastRangeRef = useRef(range);

  if (lastRangeRef.current !== range) {
    delete etags[range];
    lastRangeRef.current = range;
  }

  return useQuery<DashboardStats>({
    queryKey: ['dashboard', range],
    queryFn: async () => {
      const url = `/api/admin/stats?range=${range}`;
      const res = await fetch(url, {
        headers: etags[range] ? { 'If-None-Match': etags[range] } : undefined,
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.status === 304) {
        const cached = queryClient.getQueryData<DashboardStats>(['dashboard', range]);
        if (!cached) throw new HttpError('Not Modified', 304, url);
        return cached;
      }
      if (!res.ok) throw new HttpError('Failed to load', res.status, url);
      etags[range] = res.headers.get('etag') || undefined;
      return (await res.json()) as DashboardStats;
    },
    retry: 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: live ? 15_000 : undefined,
    refetchIntervalInBackground: false,
    enabled,
  });
}