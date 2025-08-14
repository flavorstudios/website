"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, MessageCircle, Mail, AlertTriangle, ChevronRight, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";

interface Notification {
  id: string;
  type: "comment" | "contact" | "flagged" | string;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  data?: Record<string, unknown>;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Keep your existing endpoint and polling. We add SSE for near-real-time updates.
  const { data, error, isLoading, mutate } = useSWR<{ notifications: Notification[] }>(
    "/api/admin/notifications",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Optimistic helpers ---
  const optimisticUpdate = (updater: (prev: Notification[]) => Notification[]) => {
    mutate(
      (prev) => ({ notifications: updater(prev?.notifications || []) }),
      { revalidate: false }
    );
  };

  const markAsRead = async (id: string) => {
    // Optimistic: flip read true locally
    optimisticUpdate((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ read: true }),
      });
      // Revalidate to sync with server state
      await mutate();
    } catch (err) {
      // Rollback if failed
      optimisticUpdate((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic: set all read
    optimisticUpdate((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
      });
      await mutate();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      // Revalidate to restore correct state
      await mutate();
    }
  };

  // --- Icons & styles ---
  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-4 w-4" />;
      case "contact":
        return <Mail className="h-4 w-4" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "comment":
        return "bg-blue-100 text-blue-600";
      case "contact":
        return "bg-green-100 text-green-600";
      case "flagged":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // --- a11y & interactions ---
  const titleId = "notifications-title";
  const descId = "notifications-desc";

  useEffect(() => {
    if (!isOpen) return;

    // Focus the dialog container when opened
    const t = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    // Close on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // --- SSE live updates (graceful fallback if endpoint not available) ---
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/admin/notifications/stream");
      const refresh = () => mutate();
      es.addEventListener("new", refresh);
      es.addEventListener("read", refresh);
      es.addEventListener("mark-all-read", refresh);
      es.addEventListener("ready", () => {}); // no-op
      es.onerror = () => {
        // If server doesn't support SSE, just rely on SWR polling
        es?.close();
      };
    } catch {
      // Ignore if SSE not supported
    }
    return () => {
      es?.close();
    };
  }, [mutate]);

  // --- Utilities ---
  const formatTime = (ts: Date | string) => {
    const d = typeof ts === "string" ? new Date(ts) : ts;
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date().getTime();
    const diff = Math.round((d.getTime() - now) / 1000); // seconds
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const abs = Math.abs(diff);

    // Choose best unit
    if (abs < 60) return rtf.format(Math.round(diff), "second");
    const min = Math.round(diff / 60);
    if (Math.abs(min) < 60) return rtf.format(min, "minute");
    const hrs = Math.round(min / 60);
    if (Math.abs(hrs) < 24) return rtf.format(hrs, "hour");
    const days = Math.round(hrs / 24);
    return rtf.format(days, "day");
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="relative h-11 w-11 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 text-center text-[11px] font-medium leading-5 text-white"
              aria-hidden="true"
              style={{ minWidth: "1.25rem", height: "1.25rem" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
            <span className="sr-only">{unreadCount} unread notifications</span>
          </>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            {/* Popover dialog */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[95vw] outline-none"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              ref={dialogRef}
              tabIndex={-1}
            >
              <Card className="border-0 bg-white/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-gray-900/90">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-gray-800 dark:to-gray-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <h3 id={titleId} className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Notifications
                      </h3>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={markAllAsRead}
                            className="h-8 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Mark all notifications as read"
                          >
                            <CheckCheck className="mr-1 h-4 w-4" />
                            Mark all read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => setIsOpen(false)}
                          aria-label="Close notifications"
                          className="h-8 w-8 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p id={descId} className="sr-only">
                      View your latest notifications. Use the mark all read button to dismiss unread items.
                    </p>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto" role="list" aria-busy={isLoading}>
                    {isLoading ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600" />
                        <p className="mt-2 text-sm text-gray-500">Loading notifications…</p>
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center text-red-500">
                        Failed to load notifications.
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => mutate()}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Retry loading notifications"
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    ) : notifications.length === 0 ? (
                      // --- Professional empty state (as requested) ---
                      <div className="grid place-items-center gap-1 px-4 py-10 text-center">
                        <Bell className="h-8 w-8 opacity-50" aria-hidden="true" />
                        <p className="text-sm font-semibold">You’re all caught up</p>
                        <p className="text-xs text-gray-500">We’ll let you know when there’s something new.</p>
                        <a
                          href="/notifications"
                          className="mt-3 inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          View all notifications <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {notifications.map((notification) => (
                          <li key={notification.id} role="listitem">
                            <button
                              type="button"
                              className={`group flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                !notification.read ? "bg-blue-50/50" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  markAsRead(notification.id);
                                }
                              }}
                              aria-label={`${notification.read ? "Read" : "Unread"} ${
                                notification.type
                              } notification: ${notification.title}`}
                            >
                              <span className={`mt-0.5 inline-flex rounded-full p-2 ${getTypeColor(notification.type)}`} aria-hidden="true">
                                {getIcon(notification.type)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {notification.title}
                                  </span>
                                  {!notification.read && (
                                    <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="Unread" />
                                  )}
                                </span>
                                <span className="mt-1 block truncate text-sm text-gray-600 dark:text-gray-300">
                                  {notification.message}
                                </span>
                                <span className="mt-1 block text-xs text-gray-400">{formatTime(notification.timestamp)}</span>
                              </span>
                              <ChevronRight className="ml-1 h-4 w-4 opacity-60 group-hover:opacity-80" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
