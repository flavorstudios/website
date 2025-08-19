import { randomUUID, createHash } from "crypto";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  href?: string;
  icon?: string;
  createdAt: Date;
  readAt?: Date | null;
  provider: "db" | "webpush" | "fcm";
  metadata?: Record<string, unknown>;
}

export interface NotificationListResult {
  items: Notification[];
  unreadCount: number;
  nextCursor: string | null;
  etag: string;
}

export interface NotificationsProvider {
  list(
    userId: string,
    opts?: { cursor?: string; limit?: number }
  ): Promise<NotificationListResult>;
  markRead(userId: string, id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}

class InMemoryProvider implements NotificationsProvider {
  private store = new Map<string, Notification[]>();

  constructor(private provider: Notification["provider"]) {
    const sample: Notification = {
      id: randomUUID(),
      userId: "admin",
      title: "Welcome",
      body: "This is a sample notification.",
      createdAt: new Date(),
      readAt: null,
      provider: this.provider,
      metadata: {},
    };
    this.store.set("admin", [sample]);
  }

  async list(
    userId: string,
    _opts?: { cursor?: string; limit?: number }
  ): Promise<NotificationListResult> {
    void _opts; // mark as intentionally unused for ESLint

    const items = this.store.get(userId) ?? [];
    const unreadCount = items.filter((n) => !n.readAt).length;

    // Normalize dates for a stable ETag
    const normalized = items.map((n) => ({
      ...n,
      createdAt:
        n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
      readAt:
        n.readAt instanceof Date ? n.readAt.toISOString() : n.readAt ?? null,
    }));
    const etag = `"${createHash("md5")
      .update(JSON.stringify(normalized))
      .digest("hex")}"`;

    return { items, unreadCount, nextCursor: null, etag };
  }

  async markRead(userId: string, id: string): Promise<void> {
    const items = this.store.get(userId);
    if (!items) return;
    const found = items.find((n) => n.id === id);
    if (found && !found.readAt) {
      found.readAt = new Date();
    }
  }

  async markAllRead(userId: string): Promise<void> {
    const items = this.store.get(userId);
    if (!items) return;
    const now = new Date();
    items.forEach((n) => {
      if (!n.readAt) n.readAt = now;
    });
  }
}

let service: NotificationsProvider | null = null;

export function getNotificationsService(): NotificationsProvider {
  if (service) return service;
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    service = new InMemoryProvider("fcm");
  } else if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    service = new InMemoryProvider("webpush");
  } else {
    service = new InMemoryProvider("db");
  }
  return service;
}
