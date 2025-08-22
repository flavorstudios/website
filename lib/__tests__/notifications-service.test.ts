import { randomUUID } from "crypto";
import { getNotificationsService } from "@/lib/notifications";

describe("NotificationsService", () => {
  it("marks notifications as read", async () => {
    const service = getNotificationsService();
    const userId = "admin";

    // Seed a notification using the optional add helper
    await service.add?.(userId, {
      id: randomUUID(),
      userId,
      title: "Test",
      body: "Body",
      createdAt: new Date(),
      readAt: null,
      provider: "db",
    });

    const firstList = await service.list(userId);
    expect(Array.isArray(firstList.items)).toBe(true);
    expect(firstList.items.length).toBeGreaterThan(0);

    const first = firstList.items[0];
    expect(first.readAt).toBeNull();

    await service.markRead(userId, first.id);

    const after = await service.list(userId);
    expect(after.items[0].readAt).toBeInstanceOf(Date);

    await service.markAllRead(userId);

    const allRead = await service.list(userId);
    expect(allRead.items.every((n) => n.readAt)).toBe(true);
  });
});
