"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface MoreAction {
  label: string
  onSelect: () => void
}

interface PrimaryActionProps {
  label: string
  onClick: () => void
  moreActions?: MoreAction[]
}

export function PrimaryAction({ label, onClick, moreActions = [] }: PrimaryActionProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={onClick}
        aria-label={label}
        className="min-h-9 px-4"
      >
        {label}
      </Button>
      {moreActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="More actions"
              className="min-h-9 px-3"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {moreActions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onSelect={action.onSelect}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export default PrimaryAction