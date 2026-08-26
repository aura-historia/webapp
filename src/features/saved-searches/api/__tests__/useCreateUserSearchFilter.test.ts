import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockCreateUserSearchFilter = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    createUserSearchFilter: mockCreateUserSearchFilter,
}));

vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));

vi.mock("@/data/internal/search-filter/UserSearchFilter.ts", () => ({
    mapToBackendCreateUserSearchFilter: (data: unknown) => data,
    mapToInternalUserSearchFilter: (data: unknown) => data,
}));

vi.mock("@/data/internal/hooks/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
    };
});

import { useCreateUserSearchFilter } from "../useCreateUserSearchFilter.ts";

describe("useCreateUserSearchFilter", () => {
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
        mockGetErrorMessage.mockImplementation(
            (error: { message?: string } | null) => error?.message ?? "Unknown error",
        );
    });

    it("returns idle state initially", () => {
        const { result } = renderHook(() => useCreateUserSearchFilter(), {
            wrapper: createWrapper(),
        });
        expect(result.current.isPending).toBe(false);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(false);
    });

    it("calls createUserSearchFilter with the mapped body", async () => {
        mockCreateUserSearchFilter.mockResolvedValue({ data: { name: "Test" }, error: null });

        const { result } = renderHook(() => useCreateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ name: "Test", search: { q: "Tisch" } });
        });

        expect(mockCreateUserSearchFilter).toHaveBeenCalledWith(
            expect.objectContaining({ body: expect.objectContaining({ name: "Test" }) }),
        );
    });

    it("invalidates userSearchFilters query on success", async () => {
        mockCreateUserSearchFilter.mockResolvedValue({ data: { name: "Test" }, error: null });

        const { result } = renderHook(() => useCreateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ name: "Test", search: { q: "" } });
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["userSearchFilters"] }),
        );
    });

    it("returns the mapped filter data on success", async () => {
        const responseData = { name: "Test" };
        mockCreateUserSearchFilter.mockResolvedValue({ data: responseData, error: null });

        const { result } = renderHook(() => useCreateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ name: "Test", search: { q: "" } });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(responseData);
    });

    it("sets isError when the API returns an error", async () => {
        mockCreateUserSearchFilter.mockResolvedValue({
            data: null,
            error: { status: 422, message: "Invalid data" },
        });

        const { result } = renderHook(() => useCreateUserSearchFilter(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            result.current.mutate({ name: "Test", search: { q: "" } });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
