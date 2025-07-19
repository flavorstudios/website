'use client'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'

export const toast = sonnerToast

export default function Toaster() {
  return <SonnerToaster richColors />
}
