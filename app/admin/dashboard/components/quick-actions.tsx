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

  const navigate = (href: string) => {
    router.push(href)
  }

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
        <DropdownMenuItem
          onClick={() => navigate("/admin/dashboard/blog-posts")}
          onSelect={() => navigate("/admin/dashboard/blog-posts")}
        >
          Create New Post
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/admin/dashboard/videos")}
          onSelect={() => navigate("/admin/dashboard/videos")}
        >
          Add Video
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/admin/dashboard/comments")}
          onSelect={() => navigate("/admin/dashboard/comments")}
        >
          Moderate Comments
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/admin/dashboard/users")}
          onSelect={() => navigate("/admin/dashboard/users")}
        >
          Manage Users
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuickActions
