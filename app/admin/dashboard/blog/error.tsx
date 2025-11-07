"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section role="alert" aria-live="assertive" className="space-y-4">
      <div
        role="heading"
        aria-level={1}
        data-testid="page-title"
        className="text-3xl font-semibold tracking-tight text-foreground"
      >
        Blog
      </div>
      <p>We could not load the blog overview.</p>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted/60 p-3 text-xs text-muted-foreground">
        {String(error?.message ?? "Unknown error")}
      </pre>
      <Button onClick={() => reset()} data-testid="retry" variant="outline">
        Retry
      </Button>
    </section>
  );
}