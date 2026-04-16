import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const mockPatchAllNotifications = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    patchAllNotifications: mockPatchAllNotifications,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

import { useMarkAllNotificationsSeen } from "../useMarkAllNotificationsSeen.ts";

describe("useMarkAllNotificationsSeen", () => {
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

    it("should call patchAllNotifications with seen: true", async () => {
        mockPatchAllNotifications.mockResolvedValue({ data: { items: [], size: 0 }, error: null });

        const { result } = renderHook(() => useMarkAllNotificationsSeen(), {
            wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(mockPatchAllNotifications).toHaveBeenCalledWith({ body: { seen: true } });
        });
    });

    it("should throw error when API returns error", async () => {
        mockPatchAllNotifications.mockResolvedValue({ error: { message: "Server error" } });
        mockGetErrorMessage.mockReturnValue("Server error");

        const { result } = renderHook(() => useMarkAllNotificationsSeen(), {
            wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe("Server error");
    });

    it("should invalidate getNotifications query on success", async () => {
        mockPatchAllNotifications.mockResolvedValue({ data: { items: [], size: 0 }, error: null });

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useMarkAllNotificationsSeen(), {
            wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["getNotifications"] });
    });
});
