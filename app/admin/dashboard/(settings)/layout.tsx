import type { ReactNode } from "react"

import { AdminShellProvider } from "@/components/admin/admin-shell-context"

export default function SettingsShellLayout({ children }: { children: ReactNode }) {
  return <AdminShellProvider variant="dashboard">{children}</AdminShellProvider>
}