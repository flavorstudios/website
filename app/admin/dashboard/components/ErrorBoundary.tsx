"use client"

import React, { ReactNode } from "react"

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught an error:", error, errorInfo)
    }
    // Optionally log errors to monitoring service like Sentry
    // Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError)
      return (
        <div>
          Section failed to load. <button onClick={() => location.reload()}>Retry</button>
        </div>
      )
    return this.props.children
  }
}

export default ErrorBoundary