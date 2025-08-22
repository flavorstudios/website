import type { ReactNode } from "react";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}