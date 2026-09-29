import { describe, expect, it, vi } from "vitest";
import { client } from "@/client/client.gen";
import {
    deleteNotification,
    deleteNotifications,
    updateAllNotificationsSeen,
    updateNotificationSeen,
    updateNotificationsSeen,
} from "@/client/sdk.gen";

describe("canonical notification endpoint paths", () => {
    it("distinguishes selected-bulk, mark-all and single identity paths", async () => {
        const patch = vi.spyOn(client, "patch").mockResolvedValue({ data: undefined } as never);
        try {
            await updateNotificationsSeen({
                body: { notificationIds: ["notification-1"], seen: true },
            });
            expect(patch).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    url: "/api/v1/me/notifications",
                    body: { notificationIds: ["notification-1"], seen: true },
                }),
            );
            await updateAllNotificationsSeen({ body: { seen: true } });
            expect(patch).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    url: "/api/v1/me/notifications/all",
                    body: { seen: true },
                }),
            );
            await updateNotificationSeen({
                path: { notificationId: "notification-1" },
                body: { seen: true },
            });
            expect(patch).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    url: "/api/v1/me/notifications/{notificationId}",
                    path: { notificationId: "notification-1" },
                }),
            );
        } finally {
            patch.mockRestore();
        }
    });
    it("keeps delete-all on the collection and single delete on notification ID", async () => {
        const remove = vi.spyOn(client, "delete").mockResolvedValue({ data: undefined } as never);
        try {
            await deleteNotifications();
            expect(remove).toHaveBeenLastCalledWith(
                expect.objectContaining({ url: "/api/v1/me/notifications" }),
            );
            await deleteNotification({ path: { notificationId: "notification-1" } });
            expect(remove).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    url: "/api/v1/me/notifications/{notificationId}",
                    path: { notificationId: "notification-1" },
                }),
            );
        } finally {
            remove.mockRestore();
        }
    });
});
