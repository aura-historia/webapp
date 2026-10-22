import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { NotificationCenterPage } from "../NotificationCenterPage.tsx";
import type { Notification } from "@/data/internal/notification/Notification.ts";
import type { useNotifications } from "@/features/notification-center/api/useNotifications.ts";

const mockUseNotifications = vi.hoisted(() => vi.fn());
const mockUseDeleteAllNotifications = vi.hoisted(() => vi.fn());
const mockUseMarkAllNotificationsSeen = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@tanstack/react-router")>()),
    useRouteContext: () => ({ timeZone: "Europe/Berlin" }),
}));

vi.mock("@/features/notification-center/api/useNotifications.ts", () => ({
    useNotifications: mockUseNotifications,
}));

vi.mock("@/features/notification-center/api/useDeleteAllNotifications.ts", () => ({
    useDeleteAllNotifications: mockUseDeleteAllNotifications,
}));

vi.mock("@/features/notification-center/api/useMarkAllNotificationsSeen.ts", () => ({
    useMarkAllNotificationsSeen: mockUseMarkAllNotificationsSeen,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("@/features/notification-center/components/NotificationRow.tsx", () => ({
    NotificationRow: ({ notification }: { notification: Notification }) => (
        <div data-testid="notification-row">{notification.notificationId}</div>
    ),
    NotificationRowSkeleton: () => <div data-testid="notification-row-skeleton" />,
}));

const NOW = new Date("2026-10-22T12:00:00Z");

const buildNotification = (overrides: Partial<Notification> = {}): Notification => ({
    notificationId: "notif-1",
    seen: false,
    created: NOW,
    updated: NOW,
    payload: {
        type: "PARTNER_APPLICATION",
        listingSourceName: "Test Shop",
        decision: "APPROVED",
        partnershipApplicationId: "app-1",
    },
    ...overrides,
});

type NotificationsMockOptions = {
    notifications?: Notification[];
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

const refetch = vi.fn();

function setMock({
    notifications = [],
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
}: NotificationsMockOptions = {}) {
    mockUseNotifications.mockReturnValue({
        data: isPending
            ? undefined
            : {
                  pages: [{ items: notifications, size: notifications.length }],
                  pageParams: [undefined],
              },
        isPending,
        error,
        refetch,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof useNotifications>);

    mockUseDeleteAllNotifications.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseMarkAllNotificationsSeen.mockReturnValue({ mutate: vi.fn(), isPending: false });
}

async function renderPage() {
    await act(async () => {
        renderWithRouter(<NotificationCenterPage />);
    });
}

describe("NotificationCenterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(NOW);
        setMock();
    });

    it("renders row skeletons while loading, without the header actions", async () => {
        setMock({ isPending: true });
        await renderPage();
        expect(screen.getAllByTestId("notification-row-skeleton")).toHaveLength(3);
        expect(screen.queryByRole("button", { name: "Alle löschen" })).not.toBeInTheDocument();
    });

    it("offers a retry when the notifications cannot be loaded", async () => {
        setMock({ error: new Error("fetch failed") });
        await renderPage();
        expect(screen.getByRole("alert")).toHaveTextContent("Benachrichtigungen nicht erreichbar.");
        await userEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it("points to the watchlist and search filters when there are no notifications", async () => {
        await renderPage();
        expect(
            screen.getByRole("heading", { name: "Noch keine Benachrichtigungen." }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: "Meine Merkliste" })[0]).toHaveAttribute(
            "href",
            "/de/me/watchlist",
        );
        expect(screen.getAllByRole("link", { name: "Meine Suchaufträge" })[0]).toHaveAttribute(
            "href",
            "/de/me/search-filters",
        );
    });

    it("groups notifications into today, this week and earlier", async () => {
        setMock({
            notifications: [
                buildNotification({ notificationId: "n1" }),
                buildNotification({
                    notificationId: "n2",
                    created: new Date("2026-10-19T09:00:00Z"),
                }),
                buildNotification({
                    notificationId: "n3",
                    created: new Date("2026-09-28T09:00:00Z"),
                }),
                buildNotification({
                    notificationId: "n4",
                    created: new Date("2026-09-20T09:00:00Z"),
                }),
            ],
        });
        await renderPage();
        const today = screen.getByRole("region", { name: "Heute" });
        const week = screen.getByRole("region", { name: "Diese Woche" });
        const earlier = screen.getByRole("region", { name: "Früher" });
        expect(within(today).getAllByTestId("notification-row")).toHaveLength(1);
        expect(within(week).getAllByTestId("notification-row")).toHaveLength(1);
        expect(within(earlier).getAllByTestId("notification-row")).toHaveLength(2);
        expect(within(earlier).getByText("2 Benachrichtigungen")).toBeInTheDocument();
    });

    it("shows mark-all-read only while something is unread", async () => {
        const mutate = vi.fn();
        setMock({ notifications: [buildNotification({ seen: false })] });
        mockUseMarkAllNotificationsSeen.mockReturnValue({ mutate, isPending: false });
        await renderPage();
        await userEvent.click(screen.getByRole("button", { name: "Alle als gelesen markieren" }));
        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it("hides mark-all-read when everything is read", async () => {
        setMock({ notifications: [buildNotification({ seen: true })] });
        await renderPage();
        expect(
            screen.queryByRole("button", { name: "Alle als gelesen markieren" }),
        ).not.toBeInTheDocument();
    });

    it("asks before deleting all notifications", async () => {
        const mutate = vi.fn();
        setMock({ notifications: [buildNotification({ seen: true })] });
        mockUseDeleteAllNotifications.mockReturnValue({ mutate, isPending: false });
        await renderPage();
        await userEvent.click(screen.getByRole("button", { name: "Alle löschen" }));
        expect(mutate).not.toHaveBeenCalled();
        const dialog = await screen.findByRole("alertdialog");
        expect(dialog).toHaveTextContent("Alle Benachrichtigungen löschen?");
        await userEvent.click(within(dialog).getByRole("button", { name: "Alle löschen" }));
        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it("shows the unread and total counts once every page is loaded", async () => {
        setMock({
            notifications: [
                buildNotification({ notificationId: "n1", seen: false }),
                buildNotification({ notificationId: "n2", seen: true }),
            ],
        });
        await renderPage();
        const overview = screen.getByRole("complementary", { name: "Übersicht" });
        expect(within(overview).getByText("Ungelesen").nextSibling).toHaveTextContent("1");
        expect(within(overview).getByText("Insgesamt").nextSibling).toHaveTextContent("2");
        expect(screen.getByText("Alle 2 Benachrichtigungen geladen")).toBeInTheDocument();
    });

    it("leaves the total out while more pages remain", async () => {
        setMock({
            notifications: [buildNotification()],
            hasNextPage: true,
            isFetchingNextPage: true,
        });
        await renderPage();
        const overview = screen.getByRole("complementary", { name: "Übersicht" });
        expect(within(overview).queryByText("Insgesamt")).not.toBeInTheDocument();
        expect(screen.getByText("Lade weitere Benachrichtigungen...")).toBeInTheDocument();
    });
});
