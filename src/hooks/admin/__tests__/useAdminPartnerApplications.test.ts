import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminPartnerApplications } from "../useAdminPartnerApplications.ts";

const mockAdminGetPartnerApplications = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    adminGetPartnerApplications: mockAdminGetPartnerApplications,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

describe("useAdminPartnerApplications", () => {
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

    it("maps partner applications including applicant user ids", async () => {
        mockAdminGetPartnerApplications.mockResolvedValue({
            data: [
                {
                    id: "app-1",
                    applicantUserId: "user-1",
                    businessState: "IN_REVIEW",
                    executionState: "WAITING",
                    payload: { type: "EXISTING", shopId: "shop-1" },
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-02T00:00:00Z",
                },
            ],
            error: null,
        });

        const { result } = renderHook(() => useAdminPartnerApplications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual([
            expect.objectContaining({
                id: "app-1",
                applicantUserId: "user-1",
                payload: { type: "EXISTING", shopId: "shop-1" },
            }),
        ]);
    });

    it("surfaces mapped API errors", async () => {
        mockAdminGetPartnerApplications.mockResolvedValue({
            data: null,
            error: { message: "Load failed" },
        });
        mockGetErrorMessage.mockReturnValue("Load failed");

        const { result } = renderHook(() => useAdminPartnerApplications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Load failed");
    });
});
