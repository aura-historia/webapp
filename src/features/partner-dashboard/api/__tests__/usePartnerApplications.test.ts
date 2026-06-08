import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PARTNER_APPLICATIONS_QUERY_KEY,
    useCreatePartnerApplication,
    usePartnerApplications,
} from "@/features/partner-dashboard/api/usePartnerApplications.ts";
import { usePartnerDashboardShopSearch } from "@/features/partner-dashboard/api/usePartnerDashboardShopSearch.ts";

const mockGetPartnerApplications = vi.hoisted(() => vi.fn());
const mockPostPartnerApplication = vi.hoisted(() => vi.fn());
const mockSimpleSearchShops = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getPartnerApplications: mockGetPartnerApplications,
    postPartnerApplication: mockPostPartnerApplication,
    simpleSearchShops: mockSimpleSearchShops,
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

    it("creates a new partner application and refreshes the dashboard list query", async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
        queryClient.setQueryData(PARTNER_APPLICATIONS_QUERY_KEY, []);
        mockPostPartnerApplication.mockResolvedValue({
            data: {
                id: "app-created",
                applicantUserId: "user-1",
                businessState: "SUBMITTED",
                executionState: "PROCESSING",
                payload: {
                    type: "NEW",
                    shopName: "Created Shop",
                    shopType: "MARKETPLACE",
                    shopDomains: ["created.example.com"],
                },
                created: "2024-02-01T00:00:00Z",
                updated: "2024-02-01T00:00:00Z",
            },
            error: null,
        });

        const { result } = renderHook(() => useCreatePartnerApplication(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            type: "NEW",
            shopName: "Created Shop",
            shopType: "MARKETPLACE",
            shopDomains: ["created.example.com"],
            shopUrl: null,
            shopImage: null,
            shopPhone: null,
            shopEmail: null,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPostPartnerApplication).toHaveBeenCalledWith({
            body: {
                type: "NEW",
                shopName: "Created Shop",
                shopType: "MARKETPLACE",
                shopDomains: ["created.example.com"],
                shopUrl: null,
                shopImage: null,
                shopPhone: null,
                shopEmail: null,
            },
        });
        expect(queryClient.getQueryData(PARTNER_APPLICATIONS_QUERY_KEY)).toEqual([
            expect.objectContaining({ id: "app-created" }),
        ]);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: PARTNER_APPLICATIONS_QUERY_KEY,
        });
    });

    it("searches shops for the existing shop picker", async () => {
        mockSimpleSearchShops.mockResolvedValue({
            data: {
                items: [
                    {
                        shopId: "550e8400-e29b-41d4-a716-446655440000",
                        shopSlugId: "aurora-antiques",
                        name: "Aurora Antiques",
                        shopType: "MARKETPLACE",
                        partnerStatus: "SCRAPED",
                        domains: ["aurora.example.com"],
                        created: "2024-01-01T00:00:00Z",
                        updated: "2024-01-02T00:00:00Z",
                    },
                    {
                        shopId: "550e8400-e29b-41d4-a716-446655440001",
                        shopSlugId: "partnered-shop",
                        name: "Partnered Shop",
                        shopType: "MARKETPLACE",
                        partnerStatus: "PARTNERED",
                        domains: ["partnered.example.com"],
                        created: "2024-01-01T00:00:00Z",
                        updated: "2024-01-02T00:00:00Z",
                    },
                ],
                size: 2,
            },
            error: null,
        });

        const { result } = renderHook(() => usePartnerDashboardShopSearch("Aurora"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockSimpleSearchShops).toHaveBeenCalledWith({
            query: {
                shopNameQuery: "Aurora",
                partnerStatus: ["SCRAPED"],
                sort: "score",
                order: "asc",
                size: 10,
            },
        });
        expect(result.current.data).toEqual([
            {
                shopId: "550e8400-e29b-41d4-a716-446655440000",
                shopSlugId: "aurora-antiques",
                name: "Aurora Antiques",
                partnerStatus: "SCRAPED",
            },
        ]);
    });
});
