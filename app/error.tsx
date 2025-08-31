"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    // Optionally log errors to an external service, e.g. Sentry.captureException(error)
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-4 text-xl font-semibold">Something went wrong</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}