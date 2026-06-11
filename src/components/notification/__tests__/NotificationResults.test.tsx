import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { NotificationResults } from "../NotificationResults.tsx";
import type { Notification } from "@/data/internal/notification/Notification.ts";
import type { useNotifications } from "@/hooks/notification/useNotifications.ts";

const mockUseNotifications = vi.hoisted(() => vi.fn());
const mockUseDeleteAllNotifications = vi.hoisted(() => vi.fn());
const mockUseMarkAllNotificationsSeen = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/notification/useNotifications.ts", () => ({
    useNotifications: mockUseNotifications,
}));

vi.mock("@/hooks/notification/useDeleteAllNotifications.ts", () => ({
    useDeleteAllNotifications: mockUseDeleteAllNotifications,
}));

vi.mock("@/hooks/notification/useMarkAllNotificationsSeen.ts", () => ({
    useMarkAllNotificationsSeen: mockUseMarkAllNotificationsSeen,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    default: () => <div data-testid="lottie-animation" />,
}));

vi.mock("@/components/notification/NotificationCard.tsx", () => ({
    NotificationCard: ({ notification }: { notification: Notification }) => (
        <div data-testid="notification-card">{notification.notificationId}</div>
    ),
}));

vi.mock("@/components/notification/NotificationCardSkeleton.tsx", () => ({
    NotificationCardSkeleton: () => <div data-testid="notification-card-skeleton" />,
}));

const buildNotification = (overrides: Partial<Notification> = {}): Notification => ({
    notificationId: "notif-1",
    originEventId: "event-1",
    seen: false,
    external: false,
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
    payload: {
        type: "PARTNER_APPLICATION",
        shopName: "Test Shop",
        partnerApplicationPayload: { type: "APPROVED", partnerApplicationId: "app-1" },
    },
    ...overrides,
});

type NotificationsMockOptions = {
    notifications?: Notification[];
    total?: number;
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

function setMock({
    notifications = [],
    total,
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
}: NotificationsMockOptions = {}) {
    const resolvedTotal = total ?? notifications.length;
    mockUseNotifications.mockReturnValue({
        data: isPending
            ? undefined
            : {
                  pages: [
                      { items: notifications, size: notifications.length, total: resolvedTotal },
                  ],
                  pageParams: [undefined],
              },
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof useNotifications>);

    mockUseDeleteAllNotifications.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseMarkAllNotificationsSeen.mockReturnValue({ mutate: vi.fn(), isPending: false });
}

describe("NotificationResults", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    describe("Loading state", () => {
        it("renders skeleton cards while loading", () => {
            setMock({ isPending: true });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getAllByTestId("notification-card-skeleton")).toHaveLength(4);
        });
    });

    describe("Error state", () => {
        it("renders error EmptyState when the hook returns an error", () => {
            setMock({ error: new Error("fetch failed") });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Benachrichtigungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
        });
    });

    describe("Empty state", () => {
        it("renders empty state when there are no notifications", () => {
            setMock({ notifications: [], total: 0 });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getByText("Keine Benachrichtigungen")).toBeInTheDocument();
            expect(
                screen.getByText("Sie haben noch keine Benachrichtigungen erhalten."),
            ).toBeInTheDocument();
        });
    });

    describe("Notification list", () => {
        it("renders one NotificationCard per notification", () => {
            setMock({
                notifications: [
                    buildNotification({ notificationId: "n1" }),
                    buildNotification({ notificationId: "n2" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getAllByTestId("notification-card")).toHaveLength(2);
        });

        it("renders the title and total count", () => {
            setMock({ notifications: [buildNotification()], total: 1 });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getByText("Benachrichtigungen")).toBeInTheDocument();
            expect(screen.getByText("1 Benachrichtigung")).toBeInTheDocument();
        });

        it("always shows the delete-all button when notifications are present", () => {
            setMock({ notifications: [buildNotification({ seen: true })], total: 1 });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getByRole("button", { name: "Alle löschen" })).toBeInTheDocument();
        });

        it("shows mark-all-read button only when there are unseen notifications", () => {
            setMock({ notifications: [buildNotification({ seen: false })], total: 1 });
            renderWithQueryClient(<NotificationResults />);
            expect(
                screen.getByRole("button", { name: "Alle als gelesen markieren" }),
            ).toBeInTheDocument();
        });

        it("hides mark-all-read button when all notifications are already seen", () => {
            setMock({ notifications: [buildNotification({ seen: true })], total: 1 });
            renderWithQueryClient(<NotificationResults />);
            expect(
                screen.queryByRole("button", { name: "Alle als gelesen markieren" }),
            ).not.toBeInTheDocument();
        });

        it("calls deleteAll.mutate when delete-all button is clicked", async () => {
            const mutateDelete = vi.fn();
            setMock({ notifications: [buildNotification({ seen: true })], total: 1 });
            mockUseDeleteAllNotifications.mockReturnValue({
                mutate: mutateDelete,
                isPending: false,
            });
            renderWithQueryClient(<NotificationResults />);
            await userEvent.click(screen.getByRole("button", { name: "Alle löschen" }));
            expect(mutateDelete).toHaveBeenCalledTimes(1);
        });

        it("calls markAllSeen.mutate when mark-all-read button is clicked", async () => {
            const mutateMark = vi.fn();
            setMock({ notifications: [buildNotification({ seen: false })], total: 1 });
            mockUseMarkAllNotificationsSeen.mockReturnValue({
                mutate: mutateMark,
                isPending: false,
            });
            renderWithQueryClient(<NotificationResults />);
            await userEvent.click(
                screen.getByRole("button", { name: "Alle als gelesen markieren" }),
            );
            expect(mutateMark).toHaveBeenCalledTimes(1);
        });
    });

    describe("Pagination", () => {
        it("shows all-loaded message when all notifications are displayed", () => {
            setMock({
                notifications: [buildNotification()],
                total: 1,
                hasNextPage: false,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getByText("1 Benachrichtigung geladen")).toBeInTheDocument();
        });

        it("shows loading-more indicator when fetching the next page", () => {
            setMock({
                notifications: [buildNotification()],
                total: 5,
                hasNextPage: true,
                isFetchingNextPage: true,
            });
            renderWithQueryClient(<NotificationResults />);
            expect(screen.getByText("Lade weitere Benachrichtigungen...")).toBeInTheDocument();
        });
    });
});
