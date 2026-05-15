import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockUpdateUserSearchFilter = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({ updateUserSearchFilter: mockUpdateUserSearchFilter }));
vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError", () => ({ mapToInternalApiError: (e: unknown) => e }));
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return { ...actual, useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }) };
});

import { useUpdateUserSearchFilter } from "../useUpdateUserSearchFilter.ts";

const mockResponseData = {
    userId: "user-1",
    userSearchFilterId: "filter-1",
    name: "Geändert",
    notifications: false,
    state: "ACTIVE" as const,
    search: {},
    created: "2024-01-01T00:00:00Z",
    updated: "2024-06-01T00:00:00Z",
};

describe("useUpdateUserSearchFilter", () => {
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

    it("calls updateUserSearchFilter with correct path and body", async () => {
        mockUpdateUserSearchFilter.mockResolvedValue({ data: mockResponseData, error: null });

        const { result } = renderHook(() => useUpdateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ id: "filter-1", patch: { name: "Geändert" } });
        });

        expect(mockUpdateUserSearchFilter).toHaveBeenCalledWith({
            path: { userSearchFilterId: "filter-1" },
            body: expect.objectContaining({ name: "Geändert" }),
        });
    });

    it("invalidates userSearchFilters and single filter query on success", async () => {
        mockUpdateUserSearchFilter.mockResolvedValue({ data: mockResponseData, error: null });

        const { result } = renderHook(() => useUpdateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ id: "filter-1", patch: { name: "Geändert" } });
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["userSearchFilters"] }),
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["userSearchFilter", "filter-1"] }),
        );
    });

    it("returns mapped filter on success", async () => {
        mockUpdateUserSearchFilter.mockResolvedValue({ data: mockResponseData, error: null });

        const { result } = renderHook(() => useUpdateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ id: "filter-1", patch: { name: "Geändert" } });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.name).toBe("Geändert");
    });

    it("sets isError when API returns error", async () => {
        mockUpdateUserSearchFilter.mockResolvedValue({ data: null, error: { status: 404 } });

        const { result } = renderHook(() => useUpdateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ id: "filter-1", patch: { name: "X" } });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
