"use client"

import { useMemo, useState, useId } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { fetcher } from "@/lib/fetcher"
import { Check, Trash2, Undo2 } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date | string
  read: boolean
  href?: string
  priority?: "low" | "medium" | "high" | "normal" | string
}

function formatTime(ts: Date | string) {
  const d = typeof ts === 'string' ? new Date(ts) : ts
  if (Number.isNaN(d.getTime())) return ''
  const now = Date.now()
  const diff = Math.round((d.getTime() - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const abs = Math.abs(diff)
  if (abs < 60) return rtf.format(Math.round(diff), 'second')
  const min = Math.round(diff / 60)
  if (Math.abs(min) < 60) return rtf.format(min, 'minute')
  const hrs = Math.round(min / 60)
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour')
  const days = Math.round(hrs / 24)
  if (Math.abs(days) < 7) return rtf.format(days, 'day')
  const weeks = Math.round(days / 7)
  return rtf.format(weeks, 'week')
}

export default function NotificationsPage() {
  const headingId = useId()
  const { data, error, isLoading, mutate } = useSWR<{ notifications: Notification[] }>(
    "/api/admin/notifications",
    fetcher,
    { refreshInterval: 30000 }
  )

  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications])
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])
  const [view, setView] = useState<"all" | "unread" | "important">("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notifications.filter((n) => {
      if (view === "unread" && n.read) return false
      if (view === "important" && n.priority !== "high") return false
      if (!q) return true
      const title = n.title.toLowerCase()
      const msg = n.message.toLowerCase()
      return title.includes(q) || msg.includes(q)
    })
  }, [notifications, view, query])

  const markAsRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ read: true })
    })
    void mutate()
  }

  const markAsUnread = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ read: false })
    })
    void mutate()
  }

  const deleteNotification = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    void mutate()
  }

  const markAllAsRead = async () => {
    await fetch('/api/admin/notifications/mark-all-read', {
      method: 'POST',
      credentials: 'include'
    })
    void mutate()
  }

  if (isLoading) {
    return <p className="p-4 text-center text-sm text-muted-foreground">Loading notifications…</p>
  }
  if (error) {
    return (
      <p className="p-4 text-center text-sm text-destructive">
        Failed to load notifications
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <section aria-labelledby={headingId} className="space-y-4">
        <PageHeader
          headingId={headingId}
          title="Notifications"
          description="Review updates across your studio and triage alerts."
          actions=
            {unreadCount > 0 ? (
              <Button size="sm" variant="ghost" onClick={markAllAsRead} className="gap-1">
                <Check className="h-4 w-4" /> Mark all read
              </Button>
            ) : undefined}
        />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2">
          {(["all", "unread", "important"] as const).map((t) => (
            <Button
              key={t}
              variant={view === t ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setView(t)}
            >
              {t === "all" ? "All" : t === "unread" ? "Unread" : "Important"}
            </Button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notifications"
          className="h-8 flex-1 min-w-[180px]"
          aria-label="Search notifications"
        />
      </div>
      {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => (
              <li key={n.id}>
                <Card
                  className={cn(n.read ? "bg-background" : "border-blue-200 bg-blue-50")}
                >
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="space-y-1">
                      {n.href ? (
                        <a
                          href={n.href}
                          onClick={() => markAsRead(n.id)}
                          className="font-medium hover:underline"
                        >
                          {n.title}
                        </a>
                      ) : (
                        <p className="font-medium">{n.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(n.timestamp)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => (n.read ? markAsUnread(n.id) : markAsRead(n.id))}
                        aria-label={n.read ? "Mark unread" : "Mark read"}
                      >
                        {n.read ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(n.id)}
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
