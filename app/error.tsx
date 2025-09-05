"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type AppError = Error & { digest?: string };

export default function Error({
  error,
  reset,
}: {
  error: AppError;
  reset: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    console.error(error);
    // Optionally log errors to an external service, e.g. Sentry.captureException(error)

    if (typeof document !== "undefined" && document.cookie.includes("admin-session=")) {
      setIsAdmin(true);
    }
  }, [error]);

  const isProd = process.env.NODE_ENV === "production";
  const requestId = error.digest;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-4 text-xl font-semibold">Something went wrong</h2>

      {isAdmin ? (
        <>
          <p className="mb-2 text-sm text-muted-foreground">{error.message}</p>
          {requestId && (
            <p className="mb-4 text-xs text-muted-foreground">Request ID: {requestId}</p>
          )}
          {!isProd && error.stack && (
            <pre className="mb-4 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs">
              {error.stack}
            </pre>
          )}
        </>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          Please
          <Link href="/support" className="text-blue-600 hover:underline">
            {" "}visit our support center
          </Link>{" "}
          if the problem persists.
        </p>
      )}
      
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}