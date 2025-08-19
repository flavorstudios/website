// app/admin/dashboard/components/header/primary-action.tsx
"use client"

import { Button } from "@/components/ui/button"

interface PrimaryActionProps {
  label: string
  onClick: () => void
}

export function PrimaryAction({ label, onClick }: PrimaryActionProps) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      aria-label={label}
      className="min-h-9 px-4"
    >
      {label}
    </Button>
  )
}

export default PrimaryAction
