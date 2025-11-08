import type { ReactNode } from "react"

import { AdminShellProvider } from "@/components/admin/admin-shell-context"

export default function SettingsShellLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider variant="settings">
      <main
        id="admin-settings"
        role="main"
        data-admin-shell-variant="settings"
        className="min-h-screen bg-background"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </AdminShellProvider>
  )
}