"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export function QuickActions() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          aria-label="Quick actions"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => router.push("/admin/blog/create")}>
          New Blog Post
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/admin/dashboard/media?upload=1")}>
          Upload Media
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/admin/dashboard/users?mode=create")}>
          Add User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuickActions
