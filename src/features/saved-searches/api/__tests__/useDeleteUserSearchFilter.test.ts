import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockDeleteUserSearchFilter = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));
const mockInvalidateQueries = vi.hoisted(() => vi.fn());
const mockRemoveQueries = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({ deleteUserSearchFilter: mockDeleteUserSearchFilter }));
vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError", () => ({ mapToInternalApiError: (e: unknown) => e }));
const mockPatchListingUserState = vi.hoisted(() => vi.fn());
const mockInvalidateListingQueries = vi.hoisted(() => vi.fn());
vi.mock("@/features/product/catalog/lib/listingUserStateCache.ts", async (importOriginal) => ({
    ...(await importOriginal<
        typeof import("@/features/product/catalog/lib/listingUserStateCache.ts")
    >()),
    patchListingUserState: mockPatchListingUserState,
    invalidateListingQueries: mockInvalidateListingQueries,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useQueryClient: () => ({
            invalidateQueries: mockInvalidateQueries,
            removeQueries: mockRemoveQueries,
        }),
    };
});

import { useDeleteUserSearchFilter } from "../useDeleteUserSearchFilter.ts";

describe("useDeleteUserSearchFilter", () => {
    let queryClient: QueryClient;
    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("calls deleteUserSearchFilter with correct path", async () => {
        mockDeleteUserSearchFilter.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useDeleteUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate("filter-99");
        });

        expect(mockDeleteUserSearchFilter).toHaveBeenCalledWith({
            path: { userSearchFilterId: "filter-99" },
        });
    });

    it("invalidates userSearchFilters on success", async () => {
        mockDeleteUserSearchFilter.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useDeleteUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate("filter-99");
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["userSearchFilters"] }),
        );
    });

    it("removes single filter and match queries on success", async () => {
        mockDeleteUserSearchFilter.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useDeleteUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate("filter-99");
        });

        expect(mockRemoveQueries).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["userSearchFilter", "filter-99"] }),
        );
        expect(mockRemoveQueries).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["productListings", "savedSearchMatches", "filter-99"],
            }),
        );
    });

    it("clears the deleted filter's match state from cached listings and refetches them", async () => {
        mockDeleteUserSearchFilter.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useDeleteUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate("filter-99");
        });

        expect(mockPatchListingUserState).toHaveBeenCalledWith(
            expect.anything(),
            "allListings",
            expect.any(Function),
        );
        const update = mockPatchListingUserState.mock.calls[0][2];
        const state = {
            watchlist: { watching: false, notifications: false },
            notification: { unseenNotificationIds: [] },
            searchFilter: {
                matched: true,
                hidden: false,
                userSearchFilterId: "filter-99",
                userSearchFilterName: "Vases",
            },
        };
        expect(update(state).searchFilter).toEqual({ matched: false, hidden: false });
        expect(mockInvalidateListingQueries).toHaveBeenCalled();
    });

    it("sets isError when API returns error", async () => {
        mockDeleteUserSearchFilter.mockResolvedValue({ error: { status: 404 } });

        const { result } = renderHook(() => useDeleteUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate("filter-99");
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
