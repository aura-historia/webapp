import { renderWithRouter } from "@/test/utils.tsx";
import { NotificationCard } from "../NotificationCard.tsx";
import { screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Notification } from "@/data/internal/notification/Notification.ts";
import { notification, watchlistPayload } from "../../__tests__/fixtures.ts";
import { NotificationItem } from "../NotificationItem.tsx";

const mockUseUserAccount = vi.hoisted(() => vi.fn());
const mockUseMarkNotificationSeen = vi.hoisted(() => vi.fn());
const mockUseDeleteNotification = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@tanstack/react-router")>()),
    useRouteContext: () => ({ timeZone: "America/New_York" }),
}));

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
            notificationId: "notification-1",
            seen: false,
            created: new Date("2024-04-01T10:00:00Z"),
            updated: new Date("2024-04-01T10:00:00Z"),
            payload: {
                type: "PARTNER_APPLICATION",
                listingSourceName: "Antique Shop",
                image: "https://example.com/logo.png",
                decision: "APPROVED",
                partnershipApplicationId: "partner-application-1",
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

    for (const Component of [NotificationCard, NotificationItem]) {
        describe(Component.name, () => {
            it("formats near-midnight dates in the server-provided visitor timezone", async () => {
                const value = notification({ created: "2026-09-10T00:30:00Z" });
                await act(async () => {
                    renderWithRouter(<Component notification={value} />);
                });
                expect(screen.getByText("09.09.2026")).toBeInTheDocument();
                expect(screen.queryByText("10.09.2026")).not.toBeInTheDocument();
            });
            it("renders redacted on-request/null prices without a listing link or image", async () => {
                const value = notification({
                    payload: {
                        ...watchlistPayload,
                        title: null,
                        image: null,
                        productListingTitleSlugId: "",
                        change: {
                            type: "PRICE_CHANGE",
                            oldPrice: null,
                            newPrice: { type: "ON_REQUEST" },
                        },
                    },
                });
                await act(async () => {
                    renderWithRouter(<Component notification={value} />);
                });
                expect(screen.getByText("Unbenanntes Objekt")).toBeInTheDocument();
                expect(
                    screen.queryByRole("link", { name: "Unbenanntes Objekt" }),
                ).not.toBeInTheDocument();
                expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
                expect(screen.getByText("Preis auf Anfrage")).toBeInTheDocument();
                expect(document.querySelector("img")).not.toBeInTheDocument();
            });

            it("marks and deletes using notification ID", async () => {
                await act(async () => {
                    renderWithRouter(<Component notification={notification()} />);
                });
                const buttons = screen.getAllByRole("button");
                await act(async () => {
                    buttons[0].click();
                    buttons[1].click();
                });
                expect(mockUseMarkNotificationSeen().mutate).toHaveBeenCalledWith("notification-1");
                expect(mockUseDeleteNotification().mutate).toHaveBeenCalledWith("notification-1");
                expect(screen.getByRole("link", { name: "Vintage Vase" })).toHaveAttribute(
                    "href",
                    "/de/products/vintage-vase",
                );
            });

            it("renders nullable availability", async () => {
                const value = notification({
                    kind: "WATCHLIST_AVAILABILITY_CHANGED",
                    payload: {
                        ...watchlistPayload,
                        change: {
                            type: "AVAILABILITY_CHANGE",
                            oldAvailability: null,
                            newAvailability: "SOLD_OUT",
                        },
                    },
                });
                await act(async () => {
                    renderWithRouter(<Component notification={value} />);
                });
                expect(screen.getByText("Vintage Vase")).toBeInTheDocument();
                expect(
                    screen.queryByText("product.listingAvailability.unknown"),
                ).not.toBeInTheDocument();
            });

            it("renders a search filter match", async () => {
                const { change: _change, ...product } = watchlistPayload;
                const value = notification({
                    kind: "SEARCH_FILTER_MATCH",
                    payload: {
                        ...product,
                        userSearchFilterId: "filter-1",
                        userSearchFilterName: "Vases",
                    },
                });
                await act(async () => {
                    renderWithRouter(<Component notification={value} />);
                });
                expect(screen.getByText("Vintage Vase")).toBeInTheDocument();
            });

            it.each(["APPROVED", "REJECTED"] as const)(
                "renders partnership %s without a logo",
                async (decision) => {
                    const value = notification({
                        kind:
                            decision === "APPROVED"
                                ? "PARTNERSHIP_APPLICATION_APPROVED"
                                : "PARTNERSHIP_APPLICATION_REJECTED",
                        payload: {
                            partnershipApplicationId: "application-1",
                            decision,
                            listingSourceName: "Shop",
                            image: null,
                        },
                    });
                    await act(async () => {
                        renderWithRouter(<Component notification={value} />);
                    });
                    expect(screen.getByText("Shop")).toBeInTheDocument();
                    expect(document.querySelector("img")).not.toBeInTheDocument();
                },
            );
        });
    }
});
