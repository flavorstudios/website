"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught an error", error, info)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 mb-4 border border-red-200 rounded bg-red-50">
          <p className="text-sm text-red-700 mb-2">Something went wrong.</p>
          <Button variant="outline" onClick={this.handleRetry}>Retry</Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
export { ErrorBoundary }