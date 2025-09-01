'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { toast as sonnerToast } from 'sonner'

const ToastContext = createContext(sonnerToast)

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastContext.Provider value={sonnerToast}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const toast = useContext(ToastContext)
  return {
    toast,
    success: (message: string, options?: Parameters<typeof toast.success>[1]) =>
      toast.success(message, options),
    error: (message: string, options?: Parameters<typeof toast.error>[1]) =>
      toast.error(message, options),
    warning: (message: string, options?: Parameters<typeof toast.warning>[1]) =>
      toast.warning(message, options),
  }
}