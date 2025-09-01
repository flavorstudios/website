'use client';
import { useState, useEffect } from 'react';
import { HttpError } from '@/lib/http';
import { clientEnv } from '@/env/client';

type Loader<T> = () => Promise<T>;
type Render<T> = (data: T) => React.ReactNode;

export function RetryableSection<T>({
  load,
  render,
  empty,
}: {
  load: Loader<T>;
  render: Render<T>;
  empty?: React.ReactNode;
}) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({
    loading: true,
  });

  const run = async () => {
    setState({ loading: true });
    try {
      const data = await load();
      setState({ data, loading: false });
    } catch (e: unknown) {
      setState({ error: e as Error, loading: false });
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.loading) return <div className="p-4 text-sm opacity-80">Loading…</div>;
  if (state.error) {
    if (clientEnv.NODE_ENV === 'development') {
      const e = state.error as HttpError;
      return (
        <div className="p-4 rounded-lg border bg-red-50 text-red-900 space-y-2">
          <div className="font-semibold">Failed to load section</div>
          {e.status && (
            <div className="text-sm">Status: {e.status} • URL: {e.url}</div>
          )}
          {e.bodySnippet && (
            <pre className="text-xs overflow-auto">{e.bodySnippet}</pre>
          )}
          <button
            onClick={run}
            className="min-h-11 px-4 rounded-lg border bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="p-4 rounded-lg border bg-amber-50 flex items-center justify-between">
        <div className="text-sm">Section failed to load. Retry</div>
        <button
          onClick={run}
          className="min-h-11 px-4 rounded-lg border bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!state.data && empty) return <>{empty}</>;
  return <>{render(state.data as T)}</>;
}