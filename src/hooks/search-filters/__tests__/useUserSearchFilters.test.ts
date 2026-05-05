import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockGetUserSearchFilters = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getUserSearchFilters: mockGetUserSearchFilters,
}));

vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));

vi.mock("@/data/internal/search-filter/UserSearchFilterCollection.ts", () => ({
    mapToInternalUserSearchFilterCollection: (data: unknown) => data,
}));

vi.mock("@/data/internal/hooks/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

import { useUserSearchFilters } from "../useUserSearchFilters.ts";

describe("useUserSearchFilters", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        mockGetErrorMessage.mockImplementation(
            (error: { message?: string } | null) => error?.message ?? "Unknown error",
        );
    });

    it("returns loading state initially", () => {
        mockGetUserSearchFilters.mockResolvedValue({
            data: { items: [], from: 0, size: 0 },
            error: null,
        });

        const { result } = renderHook(() => useUserSearchFilters(), { wrapper: createWrapper() });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
    });

    it("does not fetch when enabled is false", () => {
        const { result } = renderHook(() => useUserSearchFilters(false), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetUserSearchFilters).not.toHaveBeenCalled();
    });

    it("fetches and returns the mapped collection", async () => {
        const collectionData = { items: [{ name: "Filter A" }], from: 0, size: 1, total: 1 };
        mockGetUserSearchFilters.mockResolvedValue({ data: collectionData, error: null });

        const { result } = renderHook(() => useUserSearchFilters(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(collectionData);
    });

    it("calls the API with sort and order params", async () => {
        mockGetUserSearchFilters.mockResolvedValue({
            data: { items: [], from: 0, size: 0 },
            error: null,
        });

        renderHook(() => useUserSearchFilters(), { wrapper: createWrapper() });

        await waitFor(() => expect(mockGetUserSearchFilters).toHaveBeenCalledTimes(1));
        expect(mockGetUserSearchFilters).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({ sort: "created", order: "desc" }),
            }),
        );
    });

    it("caches data under the correct query key", async () => {
        mockGetUserSearchFilters.mockResolvedValue({
            data: { items: [], from: 0, size: 0 },
            error: null,
        });

        renderHook(() => useUserSearchFilters(), { wrapper: createWrapper() });

        await waitFor(() => expect(queryClient.getQueryData(["userSearchFilters"])).toBeDefined());
    });

    it("sets isError and exposes the error message when the API fails", async () => {
        mockGetUserSearchFilters.mockResolvedValue({
            data: null,
            error: { status: 500, message: "Server Error" },
        });
        mockGetErrorMessage.mockReturnValue("Server Error");

        const { result } = renderHook(() => useUserSearchFilters(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error?.message).toBe("Server Error");
    });

    it("starts fetching when enabled changes from false to true", async () => {
        mockGetUserSearchFilters.mockResolvedValue({
            data: { items: [], from: 0, size: 0 },
            error: null,
        });

        const { result, rerender } = renderHook(({ enabled }) => useUserSearchFilters(enabled), {
            wrapper: createWrapper(),
            initialProps: { enabled: false },
        });

        expect(mockGetUserSearchFilters).not.toHaveBeenCalled();

        rerender({ enabled: true });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mockGetUserSearchFilters).toHaveBeenCalled();
    });
});
