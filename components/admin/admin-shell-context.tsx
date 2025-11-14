"use client"

import { createContext, useContext } from "react"
import type { ReactNode } from "react"

export type AdminShellVariant = "dashboard"

type AdminShellContextValue = {
  variant: AdminShellVariant
}

const AdminShellContext = createContext<AdminShellContextValue | null>(null)

export function AdminShellProvider({ variant, children }: { variant: AdminShellVariant; children: ReactNode }) {
  return <AdminShellContext.Provider value={{ variant }}>{children}</AdminShellContext.Provider>
}

export function useAdminShellVariant() {
  const value = useContext(AdminShellContext)
  if (!value) {
    throw new Error("useAdminShellVariant must be used within an AdminShellProvider")
  }
  return value.variant
}