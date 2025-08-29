'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/fetcher'
import { Check, Trash2, Undo2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date | string
  read: boolean
  href?: string
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
  const { data, error, isLoading, mutate } = useSWR<{ notifications: Notification[] }>(
    '/api/admin/notifications',
    fetcher,
    { refreshInterval: 30000 }
  )

  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications])
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllAsRead} className="gap-1">
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {"You're"} all caught up.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border p-4 ${n.read ? 'bg-background' : 'bg-blue-50'}`}
            >
              <div className="flex items-start justify-between gap-4">
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
                    aria-label={n.read ? 'Mark unread' : 'Mark read'}
                  >
                    {n.read ? (
                      <Undo2 className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
