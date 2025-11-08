/* eslint-disable local/no-h1-outside-page */
"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("admin-blog-error", error);
  }, [error]);

  return (
    <section role="alert" aria-live="assertive" className="space-y-4">
      <header className="space-y-2">
        <h1
          data-testid="page-title"
          className="text-3xl font-semibold tracking-tight text-foreground"
        >
          Blog
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your blog posts, drafts, and editorial calendar.
        </p>
      </header>

      <p className="text-sm text-muted-foreground">
        We couldn’t load the latest blog activity. You can retry once your connection
        is stable.
      </p>

      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted/60 p-3 text-xs text-muted-foreground">
        {String(error?.message ?? "Unknown error")}
      </pre>
      
      <button
        type="button"
        onClick={() => reset()}
        data-testid="retry"
        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Retry
      </button>
    </section>
  );
}