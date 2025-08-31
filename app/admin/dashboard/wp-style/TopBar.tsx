"use client"

import { Search, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ADMIN_SEARCH } from "@/lib/admin-events"

interface TopBarProps {
  onQuickAction?: (action: string) => void
}

export default function TopBar({ onQuickAction }: TopBarProps) {
  const [term, setTerm] = useState("")
  const actions = [
    { id: "new-post", label: "New Post" },
    { id: "upload-media", label: "Upload" },
  ]

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent(ADMIN_SEARCH, { detail: term }))
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 border-b bg-white">
      <form onSubmit={submitSearch} className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search..."
          className="pl-8 w-full"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-label="Search"
        />
      </form>
      <div className="flex items-center gap-3">
        {actions.map((a) => (
          <Button key={a.id} size="sm" onClick={() => onQuickAction?.(a.id)}>
            <Plus className="h-4 w-4 mr-2" /> {a.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
