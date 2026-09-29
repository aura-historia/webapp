import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createElement } from "react";
import type { ReactNode } from "react";

const mockPatchNotification = vi.fn();
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    updateNotificationSeen: (...args: unknown[]) => mockPatchNotification(...args),
}));
vi.mock("sonner", () => ({ toast: { error: mockToastError } }));
vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({
        getErrorMessage: vi.fn(() => "Ein unerwarteter Fehler ist aufgetreten."),
    }),
}));
vi.mock("@/data/internal/hooks/ApiError", () => ({ mapToInternalApiError: (e: unknown) => e }));

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
        mockPatchNotification.mockResolvedValue({ data: undefined });

        const wrapper = createWrapper();
        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });

        result.current.mutate("notification-123");

        await waitFor(() => {
            expect(mockPatchNotification).toHaveBeenCalledWith({
                path: { notificationId: "notification-123" },
                body: { seen: true },
            });
        });
    });

    it("should throw error when API returns error", async () => {
        mockPatchNotification.mockResolvedValue({ error: { message: "Not found" } });

        const wrapper = createWrapper();
        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });

        result.current.mutate("notification-456");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error?.message).toBe("Ein unerwarteter Fehler ist aufgetreten.");
        });
    });

    it("shows error toast when API returns error", async () => {
        mockPatchNotification.mockResolvedValue({ error: { status: 500 } });

        const wrapper = createWrapper();
        const { result } = renderHook(() => useMarkNotificationSeen(), { wrapper });

        result.current.mutate("notification-456");

        await waitFor(() =>
            expect(mockToastError).toHaveBeenCalledWith("Ein unerwarteter Fehler ist aufgetreten."),
        );
    });

    it("should invalidate correct query keys on success", async () => {
        mockPatchNotification.mockResolvedValue({ data: undefined });

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

        result.current.mutate("notification-789");

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["getNotifications", "user-1"] });
    });
});

vi.mock("aws-amplify/auth", () => ({ getCurrentUser: async () => ({ userId: "user-1" }) }));
