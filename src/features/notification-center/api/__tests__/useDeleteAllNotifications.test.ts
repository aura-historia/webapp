import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const mockDeleteAllNotifications = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    deleteAllNotifications: mockDeleteAllNotifications,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

import { useDeleteAllNotifications } from "../useDeleteAllNotifications.ts";

describe("useDeleteAllNotifications", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("should call deleteAllNotifications", async () => {
        mockDeleteAllNotifications.mockResolvedValue({ data: null, error: null });

        const { result } = renderHook(() => useDeleteAllNotifications(), {
            wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(mockDeleteAllNotifications).toHaveBeenCalledTimes(1);
        });
    });

    it("should throw error when API returns error", async () => {
        mockDeleteAllNotifications.mockResolvedValue({ error: { message: "Server error" } });
        mockGetErrorMessage.mockReturnValue("Server error");

        const { result } = renderHook(() => useDeleteAllNotifications(), {
            wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe("Server error");
    });

    it("should invalidate getNotifications query on success", async () => {
        mockDeleteAllNotifications.mockResolvedValue({ data: null, error: null });

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useDeleteAllNotifications(), {
            wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["getNotifications"] });
    });
});
