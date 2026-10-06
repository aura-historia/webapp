import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { notification } from "../../__tests__/fixtures.ts";
import { useMarkNotificationsSeen } from "../useMarkNotificationsSeen.ts";
import { useMarkNotificationSeen } from "../useMarkNotificationSeen.ts";
import { useMarkAllNotificationsSeen } from "../useMarkAllNotificationsSeen.ts";
import { useDeleteNotification } from "../useDeleteNotification.ts";
import { useDeleteAllNotifications } from "../useDeleteAllNotifications.ts";

const api = vi.hoisted(() => ({
    updateNotificationSeen: vi.fn(),
    updateNotificationsSeen: vi.fn(),
    updateAllNotificationsSeen: vi.fn(),
    deleteNotification: vi.fn(),
    deleteNotifications: vi.fn(),
}));
const auth = vi.hoisted(() => ({ userId: "user-1" as string | undefined }));
vi.mock("aws-amplify/auth", () => ({
    getCurrentUser: async () => {
        if (!auth.userId) throw new Error("Signed out");
        return { userId: auth.userId };
    },
}));
vi.mock("@/client", () => api);
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Request failed" }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

describe("204 notification mutations", () => {
    let client: QueryClient;
    const key = ["getNotifications", "user-1", "en"];
    const listingKey = ["search", "query"];
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);
    const cachedItems = () =>
        client
            .getQueryData<{ pages: { items: { notificationId: string; seen: boolean }[] }[] }>(key)
            ?.pages.flatMap((page) => page.items);
    const unread = () =>
        client.getQueryData<{
            products: {
                userState: {
                    notification: {
                        unseenNotificationIds: string[];
                        hasUnseenNotification: boolean;
                    };
                };
            }[];
        }>(listingKey)?.products[0].userState.notification;
    beforeEach(() => {
        vi.clearAllMocks();
        auth.userId = "user-1";
        for (const method of Object.values(api))
            method.mockResolvedValue({ data: undefined, response: { status: 204 } });
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        client.setQueryData(key, {
            pages: [
                { items: [notification()], size: 1, searchAfter: "cursor" },
                { items: [notification({ notificationId: "notification-2" })], size: 1 },
            ],
            pageParams: [undefined, "cursor"],
        });
        client.setQueryData(listingKey, {
            products: [
                {
                    productListingId: "listing-1",
                    userState: {
                        notification: {
                            unseenNotificationIds: ["notification-1", "notification-2"],
                            hasUnseenNotification: true,
                        },
                    },
                },
            ],
        });
    });
    it("marks only the canonical notification ID and keeps remaining unread IDs", async () => {
        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });
        await act(() => result.current.mutateAsync("notification-1"));
        expect(api.updateNotificationSeen).toHaveBeenCalledWith({
            path: { notificationId: "notification-1" },
            body: { seen: true },
        });
        expect(cachedItems()?.map((item) => item.seen)).toEqual([true, false]);
        expect(unread()).toEqual({
            unseenNotificationIds: ["notification-2"],
            hasUnseenNotification: true,
        });
    });

    it("updates nested saved-search pages and generated detail wrappers", async () => {
        const detailKey = [
            { _id: "getProductListingByTitleSlug", path: { productListingTitleSlugId: "vase" } },
        ];
        const matchKey = ["searchFilterMatchedProducts", "filter-1"];
        const state = {
            notification: { unseenNotificationIds: ["notification-1", "notification-2"] },
        };
        client.setQueryData(detailKey, {
            item: { productListingId: "listing-1" },
            userState: state,
        });
        client.setQueryData(matchKey, {
            pages: [
                {
                    products: [
                        {
                            productListingId: "listing-1",
                            userState: {
                                ...state,
                                notification: {
                                    ...state.notification,
                                    hasUnseenNotification: true,
                                },
                            },
                        },
                    ],
                },
            ],
            pageParams: [undefined],
        });
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useMarkNotificationsSeen(), { wrapper });
        await act(() => result.current.mutateAsync(["notification-1", "notification-2"]));
        expect(client.getQueryData(detailKey)).toEqual({
            item: { productListingId: "listing-1" },
            userState: { notification: { unseenNotificationIds: [] } },
        });
        expect(client.getQueryData(matchKey)).toMatchObject({
            pages: [
                {
                    products: [
                        {
                            userState: {
                                notification: {
                                    unseenNotificationIds: [],
                                    hasUnseenNotification: false,
                                },
                            },
                        },
                    ],
                },
            ],
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: detailKey, exact: true });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: matchKey, exact: true });
    });

    it("updates and invalidates shop-profile listing unread state", async () => {
        const shopKey = ["sourceProductListings", "source-1", "en", "USD", 20];
        client.setQueryData(shopKey, {
            pages: [client.getQueryData(listingKey)],
            pageParams: [undefined],
        });
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useMarkNotificationsSeen(), { wrapper });
        await act(() => result.current.mutateAsync(["notification-1", "notification-2"]));
        expect(client.getQueryData(shopKey)).toMatchObject({
            pages: [
                {
                    products: [
                        {
                            userState: {
                                notification: {
                                    unseenNotificationIds: [],
                                    hasUnseenNotification: false,
                                },
                            },
                        },
                    ],
                },
            ],
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: shopKey, exact: true });
    });

    it("leaves other viewers' partitioned caches unchanged", async () => {
        const otherKey = ["getNotifications", "user-2", "en"];
        const otherWatchlistKey = ["watchlist", "user-2", "en", "USD"];
        const otherListingKey = ["productListings", "summary", "en", "USD", "viewer", "user-2"];
        client.setQueryData(otherKey, client.getQueryData(key));
        client.setQueryData(otherWatchlistKey, client.getQueryData(listingKey));
        client.setQueryData(otherListingKey, client.getQueryData(listingKey));
        const otherNotifications = client.getQueryData(otherKey);
        const otherListings = client.getQueryData(otherWatchlistKey);
        const { result } = renderHook(() => useDeleteAllNotifications(), { wrapper });
        await act(() => result.current.mutateAsync());
        expect(client.getQueryData(otherKey)).toBe(otherNotifications);
        expect(client.getQueryData(otherWatchlistKey)).toBe(otherListings);
        expect(client.getQueryData(otherListingKey)).toBe(otherListings);
        expect(client.getQueryState(otherKey)?.isInvalidated).toBe(false);
        expect(client.getQueryState(otherWatchlistKey)?.isInvalidated).toBe(false);
    });

    it.each(["user-2", undefined])(
        "discards late mark-all responses after switching to %s",
        async (nextViewer) => {
            let resolveRequest!: (value: { data: undefined }) => void;
            api.updateAllNotificationsSeen.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveRequest = resolve;
                    }),
            );
            const { result } = renderHook(() => useMarkAllNotificationsSeen(), { wrapper });
            result.current.mutate();
            await waitFor(() => expect(api.updateAllNotificationsSeen).toHaveBeenCalled());
            const before = client.getQueryData(key);
            const beforeListings = client.getQueryData(listingKey);
            auth.userId = nextViewer;
            await act(async () => {
                resolveRequest({ data: undefined });
            });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.getQueryData(key)).toBe(before);
            expect(client.getQueryData(listingKey)).toBe(beforeListings);
            expect(client.getQueryState(listingKey)?.isInvalidated).toBe(false);
        },
    );

    it("rechecks the viewer after awaiting query cancellation", async () => {
        const before = client.getQueryData(key);
        const beforeListings = client.getQueryData(listingKey);
        vi.spyOn(client, "cancelQueries").mockImplementation(async () => {
            auth.userId = "user-2";
        });
        const { result } = renderHook(() => useDeleteAllNotifications(), { wrapper });
        await act(() => result.current.mutateAsync());
        expect(client.getQueryData(key)).toBe(before);
        expect(client.getQueryData(listingKey)).toBe(beforeListings);
    });
    it("selected-bulk sends explicit IDs, never mark-all", async () => {
        const { result } = renderHook(() => useMarkNotificationsSeen(), { wrapper });
        await act(() => result.current.mutateAsync(["notification-1", "notification-2"]));
        expect(api.updateNotificationsSeen).toHaveBeenCalledWith({
            body: { notificationIds: ["notification-1", "notification-2"], seen: true },
        });
        expect(api.updateAllNotificationsSeen).not.toHaveBeenCalled();
        expect(cachedItems()?.every((item) => item.seen)).toBe(true);
        expect(unread()?.hasUnseenNotification).toBe(false);
    });
    it("mark-all uses the dedicated operation and clears all listing unread IDs", async () => {
        const { result } = renderHook(() => useMarkAllNotificationsSeen(), { wrapper });
        await act(() => result.current.mutateAsync());
        expect(api.updateAllNotificationsSeen).toHaveBeenCalledWith({ body: { seen: true } });
        expect(api.updateNotificationsSeen).not.toHaveBeenCalled();
        expect(unread()?.unseenNotificationIds).toEqual([]);
    });
    it("deletion removes only the notification ID from pages and listing badges", async () => {
        const { result } = renderHook(() => useDeleteNotification(), { wrapper });
        await act(() => result.current.mutateAsync("notification-1"));
        expect(api.deleteNotification).toHaveBeenCalledWith({
            path: { notificationId: "notification-1" },
        });
        expect(cachedItems()?.map((item) => item.notificationId)).toEqual(["notification-2"]);
        expect(unread()?.unseenNotificationIds).toEqual(["notification-2"]);
    });
    it("collection deletion empties pages and unread state", async () => {
        const { result } = renderHook(() => useDeleteAllNotifications(), { wrapper });
        await act(() => result.current.mutateAsync());
        expect(api.deleteNotifications).toHaveBeenCalledWith();
        expect(cachedItems()).toEqual([]);
        expect(unread()?.unseenNotificationIds).toEqual([]);
    });
    it("failed requests leave caches intact", async () => {
        api.updateNotificationsSeen.mockResolvedValue({ error: { status: 503 } });
        const before = client.getQueryData(key);
        const { result } = renderHook(() => useMarkNotificationsSeen(), { wrapper });
        result.current.mutate(["notification-1"]);
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(client.getQueryData(key)).toBe(before);
        expect(unread()?.unseenNotificationIds).toHaveLength(2);
    });
    it("empty selected list does not send a request", async () => {
        const { result } = renderHook(() => useMarkNotificationsSeen(), { wrapper });
        await act(() => result.current.mutateAsync([]));
        expect(api.updateNotificationsSeen).not.toHaveBeenCalled();
    });
});
