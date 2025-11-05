'use client';
import React from 'react';
import { clientEnv } from '@/env.client';
import { logClientError } from '@/lib/log-client';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    logClientError('[ui-error]', error, info);
  }
  override render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      if (clientEnv.NODE_ENV === 'development') {
        return (
          <div className="p-4 rounded-lg border bg-red-50 text-red-900">
            <div className="font-semibold">Render error</div>
            <pre className="mt-2 text-sm overflow-auto">{String(this.state.error.stack || this.state.error.message)}</pre>
          </div>
        );
      }
      return (
        <div className="p-4 rounded-lg border bg-amber-50">
          <div className="font-medium">Something went wrong.</div>
          <div className="text-sm opacity-80">Please try again.</div>
        </div>
      );
    }
    return this.props.children;
  }
}