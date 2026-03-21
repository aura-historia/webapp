import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createElement } from "react";
import type { ReactNode } from "react";

const mockPatchNotification = vi.fn();

vi.mock("@/client", () => ({
    patchNotification: (...args: unknown[]) => mockPatchNotification(...args),
}));

import { useMarkNotificationSeen } from "../useMarkNotificationSeen.ts";

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useMarkNotificationSeen", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call patchNotification with correct params", async () => {
        mockPatchNotification.mockResolvedValue({ data: { seen: true } });

        const wrapper = createWrapper();
        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });

        result.current.mutate("event-123");

        await waitFor(() => {
            expect(mockPatchNotification).toHaveBeenCalledWith({
                path: { eventId: "event-123" },
                body: { seen: true },
            });
        });
    });

    it("should throw error when API returns error", async () => {
        mockPatchNotification.mockResolvedValue({ error: { message: "Not found" } });

        const wrapper = createWrapper();
        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });

        result.current.mutate("event-456");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error?.message).toBe("Failed to mark notification as seen");
        });
    });

    it("should invalidate correct query keys on success", async () => {
        mockPatchNotification.mockResolvedValue({ data: { seen: true } });

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });

        result.current.mutate("event-789");

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        const expectedKeys = [
            "search",
            "getSimilarProducts",
            "getProduct",
            "getProductBySlug",
            "watchlist",
            "getNotifications",
        ];

        for (const key of expectedKeys) {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [key] });
        }
    });
});
