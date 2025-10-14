"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Action = {
  label: string
  href: string
}

const actions: Action[] = [
  { label: "Create New Post", href: "/admin/dashboard/blog-posts" },
  { label: "Add Video", href: "/admin/dashboard/videos" },
  { label: "Moderate Comments", href: "/admin/dashboard/comments" },
  { label: "Manage Users", href: "/admin/dashboard/users" },
]

export function QuickActions() {
  const router = useRouter()

  const handleNavigate = (href: string) => {
    router.push(href)
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Quick actions">
      {actions.map((action) => (
        <Button
          key={action.href}
          type="button"
          size="sm"
          variant="outline"
          aria-label={action.label}
          onClick={() => handleNavigate(action.href)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

export default QuickActions