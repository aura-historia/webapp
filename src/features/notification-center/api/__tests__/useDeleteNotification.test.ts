import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const mockDeleteNotification = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    deleteNotification: mockDeleteNotification,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

import { useDeleteNotification } from "../useDeleteNotification.ts";

describe("useDeleteNotification", () => {
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

    it("should call deleteNotification with correct eventId", async () => {
        mockDeleteNotification.mockResolvedValue({ data: null, error: null });

        const { result } = renderHook(() => useDeleteNotification(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("event-123");

        await waitFor(() => {
            expect(mockDeleteNotification).toHaveBeenCalledWith({
                path: { eventId: "event-123" },
            });
        });
    });

    it("should throw error when API returns error", async () => {
        mockDeleteNotification.mockResolvedValue({ error: { message: "Not found" } });
        mockGetErrorMessage.mockReturnValue("Not found");

        const { result } = renderHook(() => useDeleteNotification(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("event-456");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe("Not found");
    });

    it("should invalidate getNotifications query on success", async () => {
        mockDeleteNotification.mockResolvedValue({ data: null, error: null });

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useDeleteNotification(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("event-789");

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["getNotifications"] });
    });
});
