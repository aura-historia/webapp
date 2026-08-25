import { renderWithRouter } from "@/test/utils.tsx";
import { NotificationCard } from "../NotificationCard.tsx";
import { screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Notification } from "@/data/internal/notification/Notification.ts";

const mockUseUserAccount = vi.hoisted(() => vi.fn());
const mockUseMarkNotificationSeen = vi.hoisted(() => vi.fn());
const mockUseDeleteNotification = vi.hoisted(() => vi.fn());

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

vi.mock("@/features/notification-center/api/useMarkNotificationSeen.ts", () => ({
    useMarkNotificationSeen: mockUseMarkNotificationSeen,
}));

vi.mock("@/features/notification-center/api/useDeleteNotification.ts", () => ({
    useDeleteNotification: mockUseDeleteNotification,
}));

describe("NotificationCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseUserAccount.mockReturnValue({
            data: { prohibitedContentConsent: false },
        });
        mockUseMarkNotificationSeen.mockReturnValue({
            isPending: false,
            mutate: vi.fn(),
        });
        mockUseDeleteNotification.mockReturnValue({
            isPending: false,
            mutate: vi.fn(),
        });
    });

    it("renders the optional partner application shop logo when present", async () => {
        const notification: Notification = {
            originEventId: "origin-event-1",
            notificationId: "notification-1",
            seen: false,
            external: false,
            created: new Date("2024-04-01T10:00:00Z"),
            updated: new Date("2024-04-01T10:00:00Z"),
            payload: {
                type: "PARTNER_APPLICATION",
                shopName: "Antique Shop",
                image: "https://example.com/logo.png",
                partnerApplicationPayload: {
                    type: "APPROVED",
                    partnerApplicationId: "partner-application-1",
                },
            },
        };

        let container!: HTMLElement;
        await act(async () => {
            ({ container } = renderWithRouter(<NotificationCard notification={notification} />));
        });

        expect(screen.getByText("Antique Shop")).toBeInTheDocument();
        expect(
            container.querySelector('img[src="https://example.com/logo.png"]'),
        ).toBeInTheDocument();
    });
});
