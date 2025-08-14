import { getNotificationsService } from "@/lib/notifications";

describe("NotificationsService", () => {
  it("marks notifications as read", async () => {
    const service = getNotificationsService();
    const userId = "admin";
    const items = await service.list(userId);
    expect(items.length).toBeGreaterThan(0);
    const first = items[0];
    expect(first.readAt).toBeNull();
    await service.markRead(userId, first.id);
    const after = await service.list(userId);
    expect(after[0].readAt).toBeInstanceOf(Date);
    await service.markAllRead(userId);
    const allRead = await service.list(userId);
    expect(allRead.every((n) => n.readAt)).toBe(true);
  });
});