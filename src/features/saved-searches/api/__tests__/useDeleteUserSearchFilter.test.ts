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
            expect.objectContaining({ queryKey: ["searchFilterMatchedProducts", "filter-99"] }),
        );
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
