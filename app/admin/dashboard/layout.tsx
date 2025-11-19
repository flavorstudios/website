"use client";

import type { ReactNode } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { E2EReadyFlag } from "@/components/E2EReadyFlag";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main role="main" data-testid="app-main" className="min-h-screen">
      <div data-testid="admin-dashboard-root" className="h-full">
        <AdminAuthGuard>
          <E2EReadyFlag />
          {children}
        </AdminAuthGuard>
      </div>
    </main>
  );
}