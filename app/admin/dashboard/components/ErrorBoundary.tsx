"use client";

import React, { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKeys?: unknown[];
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    } else {
      // Post to a server logger in production
      fetch("/api/log-client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack ?? null,
          componentStack: errorInfo.componentStack,
          path: typeof window !== "undefined" ? window.location.pathname : null,
          ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
          ts: Date.now(),
        }),
        keepalive: true,
      }).catch(() => {});
    }
    // Optionally log errors to monitoring service like Sentry
    // Sentry.captureException(error, { extra: errorInfo })
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      !areArraysShallowEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      const handleRetry =
        this.props.onRetry ?? (() => this.setState({ hasError: false }));
      return (
        <div>
          Section failed to load. <button onClick={handleRetry}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

function areArraysShallowEqual(a?: unknown[], b?: unknown[]) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
