import { getNotificationsService } from "@/lib/notifications";

describe("NotificationsService", () => {
  it("marks notifications as read", async () => {
    const service = getNotificationsService();
    const userId = "admin";

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
