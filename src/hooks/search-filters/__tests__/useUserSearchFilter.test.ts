import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockGetUserSearchFilter = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getUserSearchFilter: mockGetUserSearchFilter,
}));

vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));

vi.mock("@/data/internal/search-filter/UserSearchFilter.ts", () => ({
    mapToInternalUserSearchFilter: (data: unknown) => data,
}));

vi.mock("@/data/internal/hooks/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

import { useUserSearchFilter } from "../useUserSearchFilter.ts";

describe("useUserSearchFilter", () => {
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
        mockGetUserSearchFilter.mockResolvedValue({ data: { name: "Test" }, error: null });

        const { result } = renderHook(() => useUserSearchFilter("filter-1"), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
    });

    it("does not fetch when id is empty", () => {
        const { result } = renderHook(() => useUserSearchFilter(""), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetUserSearchFilter).not.toHaveBeenCalled();
    });

    it("fetches and returns the mapped filter", async () => {
        const filterData = { name: "Mein Filter" };
        mockGetUserSearchFilter.mockResolvedValue({ data: filterData, error: null });

        const { result } = renderHook(() => useUserSearchFilter("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(filterData);
    });

    it("calls the API with the correct path", async () => {
        mockGetUserSearchFilter.mockResolvedValue({ data: { name: "Filter" }, error: null });

        renderHook(() => useUserSearchFilter("filter-abc"), { wrapper: createWrapper() });

        await waitFor(() => expect(mockGetUserSearchFilter).toHaveBeenCalledTimes(1));
        expect(mockGetUserSearchFilter).toHaveBeenCalledWith({
            path: { userSearchFilterId: "filter-abc" },
        });
    });

    it("caches data under the correct query key", async () => {
        mockGetUserSearchFilter.mockResolvedValue({ data: { name: "Filter" }, error: null });

        renderHook(() => useUserSearchFilter("filter-1"), { wrapper: createWrapper() });

        await waitFor(() =>
            expect(queryClient.getQueryData(["userSearchFilter", "filter-1"])).toBeDefined(),
        );
    });

    it("sets isError and exposes the error message when the API fails", async () => {
        mockGetUserSearchFilter.mockResolvedValue({
            data: null,
            error: { status: 404, message: "Not found" },
        });
        mockGetErrorMessage.mockReturnValue("Not found");

        const { result } = renderHook(() => useUserSearchFilter("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error?.message).toBe("Not found");
    });
});
