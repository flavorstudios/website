"use client";

import { useEffect } from "react";

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

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6" role="alert">
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        <p className="font-semibold">Unable to render admin settings.</p>
        <p className="mt-2 text-sm opacity-80">
          Please try again or contact support. Ref: {error?.digest ?? "N/A"}
        </p>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
          className="mt-4 inline-flex rounded bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground"
        >
          Try again
        </button>
        {reset ? (
          <button
            type="button"
            onClick={reset}
            className="ml-3 inline-flex rounded border border-destructive px-3 py-1 text-sm font-medium"
          >
            Reset page
          </button>
        ) : null}
      </div>
    </div>
  );
}