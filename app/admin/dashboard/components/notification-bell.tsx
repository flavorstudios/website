"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  X,
  MessageCircle,
  Mail,
  AlertTriangle,
  ChevronRight,
  CheckCheck,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";

interface Notification {
  id: string;
  type: "comment" | "contact" | "flagged" | string; // legacy/type support
  category?: string; // new (server may send)
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  priority?: "low" | "medium" | "high" | "normal" | string; // new
  href?: string; // new
  data?: Record<string, unknown>;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Selection and filters
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "unread" | "important">("all");

  // Prefer reduced motion (Codex suggestion)
  const prefersReducedMotion = useReducedMotion();

  // Keep your existing endpoint and polling. We add SSE for near-real-time updates.
  const { data, error, isLoading, mutate } = useSWR<{
    notifications: Notification[];
  }>("/api/admin/notifications", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const raw = useMemo(() => data?.notifications || [], [data?.notifications]);

  // Normalize to ensure category always exists (kept)
  const notifications = useMemo(
    () =>
      raw.map((n) => ({
        ...n,
        category: n.category || n.type || "other",
      })),
    [raw]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Live region to announce unread count changes
  const [liveMessage, setLiveMessage] = useState("");
  const prevUnread = useRef<number>(unreadCount);
  useEffect(() => {
    if (prevUnread.current !== unreadCount) {
      setLiveMessage(`${unreadCount} unread notifications`);
      prevUnread.current = unreadCount;
      const t = setTimeout(() => setLiveMessage(""), 800);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  // Filtered by view + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications.filter((n) => {
      if (view === "unread" && n.read) return false;
      if (view === "important" && priorityValue(n.priority) < 2) return false;
      if (!q) return true;
      const title = n.title?.toLowerCase() || "";
      const msg = n.message?.toLowerCase() || "";
      return title.includes(q) || msg.includes(q);
    });
  }, [notifications, view, query]);

  // Priority sorting (high → low) then by time (newest first)
  const priorityValue = (p?: string) => {
    switch (p) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0; // normal/undefined
    }
  };

  const sortedNotifications = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const pv = priorityValue(b.priority) - priorityValue(a.priority);
      if (pv !== 0) return pv;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return arr;
  }, [filtered]);

  // Group notifications by time buckets
  type Group = { label: string; items: Notification[] };
  const bucketLabel = (d: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d >= today) return "Today";
    if (d >= yesterday) return "Yesterday";
    return "Earlier";
  };

  const groupedNotifications = useMemo(() => {
    const map = new Map<string, Notification[]>();
    sortedNotifications.forEach((n) => {
      const label = bucketLabel(new Date(n.timestamp));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    });
    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items,
    })) as Group[];
  }, [sortedNotifications]);

  // --- Optimistic helpers (kept) ---
  const optimisticUpdate = useCallback(
    (updater: (prev: Notification[]) => Notification[]) => {
      mutate((prev) => ({ notifications: updater(prev?.notifications || []) }), {
        revalidate: false,
      });
    },
    [mutate]
  );

  const markAsRead = async (id: string) => {
    // Optimistic: flip read true locally
    optimisticUpdate((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
      optimisticUpdate((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
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

  // Selection helpers (kept)
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const selectAll = useCallback(
    () => setSelected(new Set(sortedNotifications.map((n) => n.id))),
    [sortedNotifications]
  );

  const bulkMarkRead = useCallback(async () => {
    const ids = Array.from(selected);
    optimisticUpdate((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ read: true }),
          })
        )
      );
      await mutate();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      await mutate();
    }
    clearSelection();
    setSelectionMode(false);
  }, [selected, optimisticUpdate, mutate, clearSelection]);

  // NEW: Bulk mark unread (kept from your file)
  const bulkMarkUnread = useCallback(async () => {
    const ids = Array.from(selected);
    optimisticUpdate((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: false } : n))
    );
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ read: false }),
          })
        )
      );
      await mutate();
    } catch (err) {
      console.error("Failed to mark notifications as unread:", err);
      await mutate();
    }
    clearSelection();
    setSelectionMode(false);
  }, [selected, optimisticUpdate, mutate, clearSelection]);

  const bulkDelete = useCallback(async () => {
    const ids = Array.from(selected);
    // Optimistic remove
    optimisticUpdate((prev) => prev.filter((n) => !ids.includes(n.id)));
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/notifications/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );
      await mutate();
    } catch (err) {
      console.error("Failed to delete notifications:", err);
      await mutate();
    }
    clearSelection();
    setSelectionMode(false);
  }, [selected, optimisticUpdate, mutate, clearSelection]);

  // NEW: Clear all notifications (kept from your file)
  const clearAll = async () => {
    const ids = notifications.map((n) => n.id);
    optimisticUpdate(() => []);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/notifications/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );
      await mutate();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
      await mutate();
    }
    clearSelection();
    setSelectionMode(false);
  };

  // Open item: toggle selection in selection mode, otherwise mark read and follow link (if any) (kept)
  const handleItemClick = (n: Notification) => {
    if (selectionMode) {
      toggleSelect(n.id);
      return;
    }
    void markAsRead(n.id);
    if (n.href) window.location.href = n.href;
  };

  // --- Icons & styles (kept) ---
  const getIcon = (categoryOrType: string) => {
    switch (categoryOrType) {
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

  const getTypeColor = (categoryOrType: string) => {
    switch (categoryOrType) {
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

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // --- a11y & interactions (kept) ---
  const titleId = "notifications-title";
  const descId = "notifications-desc";
  const panelId = "notifications-panel";

  useEffect(() => {
    if (!isOpen) return;

    // Focus the dialog container when opened
    const t = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    // Close on Escape + selection shortcuts (kept)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key.toLowerCase() === "r" && selected.size > 0) {
        e.preventDefault();
        void bulkMarkRead();
      }
      if (e.key.toLowerCase() === "u" && selected.size > 0) {
        e.preventDefault();
        void bulkMarkUnread();
      }
      if (e.key === "Delete" && selected.size > 0) {
        e.preventDefault();
        void bulkDelete();
      }
      if ((e.ctrlKey || (e as any).metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        selectAll();
        setSelectionMode(true);
      }
    };
    document.addEventListener("keydown", onKey as any);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey as any);
    };
    }, [isOpen, selected.size, bulkMarkRead, bulkMarkUnread, bulkDelete, selectAll]);

  // --- SSE live updates (kept) ---
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/admin/notifications/stream");
      const refresh = () => mutate();
      es.addEventListener("new", refresh);
      es.addEventListener("read", refresh);
      es.addEventListener("mark-all-read", refresh);
      es.addEventListener("deleted", refresh); // reflect deletions
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

  // --- Utilities (kept) ---
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
    if (Math.abs(days) < 7) return rtf.format(days, "day");
    const weeks = Math.round(days / 7);
    return rtf.format(weeks, "week");
  };

  const toISO = (ts: Date | string) => {
    const d = typeof ts === "string" ? new Date(ts) : ts;
    return isNaN(d.getTime()) ? "" : d.toISOString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="relative h-10 w-10 rounded-full sm:h-11 sm:w-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <>
            <motion.span
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={prefersReducedMotion ? {} : { scale: 1 }}
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

      {/* Single live region for announcing changes */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </span>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            {/* Popover dialog */}
            <motion.div
              initial={
                prefersReducedMotion ? false : { opacity: 0, y: -10, scale: 0.98 }
              }
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 top-full z-50 mt-2 w-[90vw] -translate-x-1/2 sm:left-auto sm:right-0 sm:w-[22rem] sm:translate-x-0 outline-none"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              id={panelId}
              ref={dialogRef}
              tabIndex={-1}
            >
              {/* Solid background card (no opacity/blur) */}
              <Card className="border bg-white shadow-xl rounded-2xl overflow-hidden dark:border-gray-800 dark:bg-gray-900">
                <CardContent className="p-0">
                  {/* Solid header (no gradient) */}
                  <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-2">
                      <h3 id={titleId} className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Notifications
                      </h3>
                      <div className="flex items-center gap-1">
                        {/* Selection toggle (kept) */}
                        {notifications.length > 0 &&
                          (selectionMode ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => {
                                setSelectionMode(false);
                                clearSelection();
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => setSelectionMode(true)}
                              className="h-8 px-2 text-xs"
                            >
                              Select
                            </Button>
                          ))}

                        {/* Bulk actions (kept) */}
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
                        {notifications.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={clearAll}
                            className="h-8 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Delete all notifications"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Clear all
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

                    {/* Search and view filters */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 px-4">
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
                        className="h-8 flex-1 min-w-0"
                        aria-label="Search notifications"
                      />
                    </div>
                  </div>

                  {/* Selection action bar (kept) */}
                  {selectionMode && selected.size > 0 && (
                    <div className="flex items-center justify-between gap-2 border-b bg-white px-4 py-2 text-xs dark:bg-gray-900">
                      <span>{selected.size} selected</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" type="button" onClick={selectAll} className="h-7 px-2">
                          Select all
                        </Button>
                        <Button size="sm" type="button" onClick={bulkMarkUnread} className="h-7 px-2">
                          Mark unread
                        </Button>
                        <Button size="sm" type="button" onClick={bulkMarkRead} className="h-7 px-2">
                          Mark read
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          type="button"
                          onClick={bulkDelete}
                          className="h-7 px-2"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  <div
                    className="max-h-[70vh] sm:max-h-[60vh] overflow-y-auto"
                    role="list"
                    aria-busy={isLoading}
                  >
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
                      // --- Professional empty state (kept) ---
                      <div className="grid place-items-center gap-1 px-4 py-10 text-center">
                        <Bell className="h-8 w-8 opacity-50" aria-hidden={true} />
                        <p className="text-sm font-semibold">You’re all caught up</p>
                        <p className="text-xs text-gray-500">We’ll let you know when there’s something new.</p>
                        <Link
                          href="/admin/notifications"
                          prefetch={false}
                          className="mt-3 inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => setIsOpen(false)}
                        >
                          View all notifications <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ) : (
                      // Grouped list rendering
                      <div className="space-y-3">
                        {groupedNotifications.map((group) => (
                          <div key={group.label}>
                            <div className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              {group.label}
                            </div>
                            <ul className="space-y-1">
                              {group.items.map((notification) => {
                                const checked = selected.has(notification.id);
                                const cat = notification.category || notification.type;
                                return (
                                  <li key={notification.id} role="listitem">
                                    <button
                                      type="button"
                                      className={`group flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        !notification.read ? "bg-blue-50/50" : ""
                                      }`}
                                      onClick={() => handleItemClick(notification)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          handleItemClick(notification);
                                        }
                                      }}
                                      aria-label={`${
                                        notification.read ? "Read" : "Unread"
                                      } ${cat} notification: ${notification.title}`}
                                      role={selectionMode ? "checkbox" : undefined}
                                      aria-checked={selectionMode ? checked : undefined}
                                    >
                                      {selectionMode ? (
                                        <span
                                          className={`mt-1 flex h-4 w-4 items-center justify-center rounded border ${
                                            checked ? "border-purple-600 bg-purple-600 text-white" : "border-gray-300"
                                          }`}
                                          aria-hidden="true"
                                        >
                                          {checked && <Check className="h-3 w-3" />}
                                        </span>
                                      ) : (
                                        <span
                                          className={`mt-0.5 inline-flex rounded-full p-2 ${getTypeColor(cat)}`}
                                          aria-hidden="true"
                                        >
                                          {getIcon(cat)}
                                        </span>
                                      )}

                                      <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-2">
                                          <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {notification.title}
                                          </span>
                                          {!notification.read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="Unread" />
                                          )}
                                          {notification.priority && notification.priority !== "normal" && (
                                            <span
                                              className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getPriorityBadge(
                                                notification.priority
                                              )}`}
                                            >
                                              {notification.priority}
                                            </span>
                                          )}
                                        </span>
                                        <span className="mt-1 block truncate text-sm text-gray-600 dark:text-gray-300">
                                          {notification.message}
                                        </span>
                                        <time
                                          className="mt-1 block text-xs text-gray-400"
                                          dateTime={toISO(notification.timestamp)}
                                        >
                                          {formatTime(notification.timestamp)}
                                        </time>
                                      </span>

                                      {!selectionMode && (
                                        <ChevronRight
                                          className="ml-1 h-4 w-4 opacity-60 group-hover:opacity-80"
                                          aria-hidden="true"
                                        />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
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
