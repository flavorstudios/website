"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { isClientE2EEnabled } from "@/lib/e2e-utils";

const E2E_RUNTIME_ENABLED =
  process.env.NEXT_PUBLIC_E2E === "true" ||
  process.env.NEXT_PUBLIC_E2E === "1" ||
  process.env.E2E === "true" ||
  process.env.E2E === "1";

function AdminE2EEmailGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!(E2E_RUNTIME_ENABLED || isClientE2EEnabled())) {
      return;
    }

    if (!pathname?.startsWith("/admin/dashboard")) {
      return;
    }

    let verified = false;
    try {
      const stored = window.localStorage.getItem("admin-test-email-verified");
      if (stored === "true" || stored === "1") {
        verified = true;
      } else {
        window.localStorage.setItem("admin-test-email-verified", "false");
      }
    } catch {
      verified = false;
    }

    if (!verified) {
      router.replace("/admin/verify-email");
    }
  }, [pathname, router]);

  return null;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main role="main" data-testid="app-main" className="min-h-screen">
      <AdminAuthGuard>
        <AdminE2EEmailGuard />
        {children}
      </AdminAuthGuard>
    </main>
  );
}