"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E !== "1" || typeof window === "undefined") {
      return;
    }

    const verified = window.localStorage.getItem("admin-test-email-verified") === "true";
    if (!verified && pathname?.startsWith("/admin/dashboard")) {
      router.replace("/admin/verify-email");
    }
  }, [pathname, router]);

  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}