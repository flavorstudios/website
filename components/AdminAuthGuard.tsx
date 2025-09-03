"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { clientEnv } from "@/env.client";

type Status = "loading" | "authenticated" | "unauthenticated";

/**
 * Guard that validates the admin session before rendering children.
 * - Calls /api/admin/validate-session with credentials included
 * - Shows a spinner while validating
 * - Shows a login prompt if validation fails
 * - Renders children only when authenticated
 */
export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      try {
        const res = await fetch("/api/admin/validate-session", {
          credentials: "include",
          cache: "no-store",
          headers: { "api-key": clientEnv.NEXT_PUBLIC_API_KEY || "" },
        });
        if (!cancelled) {
          setStatus(res.ok ? "authenticated" : "unauthenticated");
        }
      } catch {
        if (!cancelled) setStatus("unauthenticated");
        
        }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div data-testid="loading" className="flex items-center justify-center min-h-[40vh]">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <p className="text-gray-500 text-sm">
          Please log in to access the admin dashboard.
        </p>
        <Link href="/admin/login" className="text-purple-600 underline">
          Go to login
        </Link>
      </div>
    );
  }

  // Authenticated
  return <>{children}</>;
}
