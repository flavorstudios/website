import type { ReactNode } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { serverEnv } from "@/env/server";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGuard apiKey={serverEnv.ADMIN_API_KEY}>{children}</AdminAuthGuard>;
}