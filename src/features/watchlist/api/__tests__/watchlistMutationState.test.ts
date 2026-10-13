import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWatchlistMutation } from "../useWatchlistMutation.ts";
import { useWatchlistNotificationMutation } from "../useWatchlistNotificationMutation.ts";
import { useListingWatchlistState } from "../watchlistMutationState.ts";

const api = vi.hoisted(() => ({
    addWatchlistProduct: vi.fn(),
    deleteWatchlistProduct: vi.fn(),
    patchWatchlistProduct: vi.fn(),
}));
vi.mock("@/client", () => api);
vi.mock("sonner", () => ({ toast: { info: vi.fn(), warning: vi.fn(), error: vi.fn() } }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: (error: { message?: string }) => error?.message }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("aws-amplify/auth", () => ({ getCurrentUser: async () => ({ userId: "user-1" }) }));

type Deferred = { resolve: (value: unknown) => void };

function deferred(target: Deferred[]) {
    return () =>
        new Promise((resolve) => {
            target.push({ resolve });
        });
}

describe("useListingWatchlistState", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
    const cached = { watching: false, notifications: false };

    function renderListing(productListingId = "listing-1") {
        return renderHook(
            () => ({
                state: useListingWatchlistState(productListingId, cached),
                membership: useWatchlistMutation(productListingId),
                notifications: useWatchlistNotificationMutation(productListingId),
            }),
            { wrapper },
        );
    }

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("uses the cached state when nothing is pending", () => {
        const { result } = renderHook(
            () => useListingWatchlistState("listing-1", { watching: true, notifications: true }),
            { wrapper },
        );
        expect(result.current).toEqual({ watching: true, notifications: true });
    });

    it("shows a pending write immediately and drops it when the request fails", async () => {
        const requests: Deferred[] = [];
        api.addWatchlistProduct.mockImplementation(deferred(requests));
        const { result } = renderListing();

        act(() => result.current.membership.mutate("addToWatchlist"));
        await waitFor(() => expect(result.current.state.watching).toBe(true));

        await act(async () => {
            requests[0].resolve({
                data: null,
                error: { message: "Failed" },
                response: { status: 500 },
            });
        });
        await waitFor(() => expect(result.current.state.watching).toBe(false));
    });

    it("only overlays writes for the same listing", async () => {
        const requests: Deferred[] = [];
        api.addWatchlistProduct.mockImplementation(deferred(requests));
        const first = renderListing("listing-1");
        const other = renderListing("listing-2");

        act(() => first.result.current.membership.mutate("addToWatchlist"));
        await waitFor(() => expect(first.result.current.state.watching).toBe(true));

        expect(other.result.current.state.watching).toBe(false);
    });

    it("runs writes to one listing in order and applies the latest pending value", async () => {
        const memberships: Deferred[] = [];
        const notificationChanges: Deferred[] = [];
        api.addWatchlistProduct.mockImplementation(deferred(memberships));
        api.patchWatchlistProduct.mockImplementation(deferred(notificationChanges));
        const { result } = renderListing();

        act(() => result.current.membership.mutate("addToWatchlist"));
        act(() => result.current.notifications.mutate(true));

        await waitFor(() =>
            expect(result.current.state).toEqual({ watching: true, notifications: true }),
        );
        expect(api.addWatchlistProduct).toHaveBeenCalledTimes(1);
        expect(api.patchWatchlistProduct).not.toHaveBeenCalled();

        await act(async () => memberships[0].resolve({ data: {}, error: null }));
        await waitFor(() => expect(api.patchWatchlistProduct).toHaveBeenCalledTimes(1));
        await act(async () => notificationChanges[0].resolve({ data: {}, error: null }));
    });
});
