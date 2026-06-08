import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePartnerApplications } from "@/features/partner-dashboard/api/usePartnerApplications.ts";

const mockGetPartnerApplications = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getPartnerApplications: mockGetPartnerApplications,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

describe("usePartnerApplications", () => {
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
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("maps the authenticated user's partner applications", async () => {
        mockGetPartnerApplications.mockResolvedValue({
            data: [
                {
                    id: "app-1",
                    applicantUserId: "user-1",
                    businessState: "SUBMITTED",
                    executionState: "PROCESSING",
                    payload: {
                        type: "NEW",
                        shopName: "Vintage Shop",
                        shopType: "MARKETPLACE",
                        shopDomains: ["vintage.example.com"],
                    },
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-02T00:00:00Z",
                },
            ],
            error: null,
        });

        const { result } = renderHook(() => usePartnerApplications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual([
            expect.objectContaining({
                id: "app-1",
                businessState: "SUBMITTED",
                executionState: "PROCESSING",
                payload: expect.objectContaining({
                    type: "NEW",
                    shopName: "Vintage Shop",
                }),
            }),
        ]);
    });

    it("surfaces mapped API errors", async () => {
        mockGetPartnerApplications.mockResolvedValue({
            data: null,
            error: { message: "Load failed" },
        });
        mockGetErrorMessage.mockReturnValue("Load failed");

        const { result } = renderHook(() => usePartnerApplications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Load failed");
    });
});
