import { randomUUID } from "crypto";

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

export interface NotificationsProvider {
  list(userId: string): Promise<Notification[]>;
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

  async list(userId: string): Promise<Notification[]> {
    return this.store.get(userId) ?? [];
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