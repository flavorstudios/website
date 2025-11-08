"use client";

import { useCallback, useEffect } from "react";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    console.error("[settings:error]", error?.digest, error);
  }, [error]);

  const handleRetry = useCallback(() => {
    if (reset) {
      reset();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, [reset]);

  return (
    <div className="mx-auto max-w-xl p-6" role="alert">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Unable to load admin settings.</p>
        <p className="mt-2 text-xs text-muted-foreground/80">
          Please try again. Reference: {error?.digest ?? "N/A"}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Retry
        </button>
      </div>
    </div>
  );
}