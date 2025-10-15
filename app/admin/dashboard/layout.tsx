"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { isClientE2EEnabled } from "@/lib/e2e-utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !isClientE2EEnabled()) {
      return;
    }

    const status = window.localStorage.getItem("admin-test-email-verified");
    if (status === "false" && pathname?.startsWith("/admin/dashboard")) {
      router.replace("/admin/verify-email");
    }
  }, [pathname, router]);

  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}