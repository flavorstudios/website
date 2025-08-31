"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, BookOpen, Keyboard, LifeBuoy } from "lucide-react"
import { DOCS_URL } from "@/lib/constants"

export function HelpMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
        variant="ghost"
          size="sm"
          aria-label="Help menu"
          className="h-9 w-9 p-0"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => window.open(DOCS_URL, "_blank")}> 
          <BookOpen className="h-4 w-4 mr-2" /> Documentation
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            window.dispatchEvent(
              new Event("admin-open-keyboard-shortcuts")
            )
          }
        >
          <Keyboard className="h-4 w-4 mr-2" /> Keyboard Shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => window.open("/support", "_blank")}> 
          <LifeBuoy className="h-4 w-4 mr-2" /> Contact Support
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HelpMenu