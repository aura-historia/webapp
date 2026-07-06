import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PARTNER_APPLICATIONS_QUERY_KEY,
    partnerApplicationDetailQueryKey,
    useCreatePartnerApplication,
    useDeletePartnerApplication,
    usePartnerApplicationDetails,
    usePartnerApplications,
    useUpdatePartnerApplication,
} from "@/features/partner/dashboard/api/usePartnerApplications.ts";
import { usePartnerDashboardShopSearch } from "@/features/partner/dashboard/api/usePartnerDashboardShopSearch.ts";

const mockGetPartnerApplications = vi.hoisted(() => vi.fn());
const mockGetPartnerApplication = vi.hoisted(() => vi.fn());
const mockPostPartnerApplication = vi.hoisted(() => vi.fn());
const mockDeletePartnerApplication = vi.hoisted(() => vi.fn());
const mockPatchPartnerApplication = vi.hoisted(() => vi.fn());
const mockSimpleSearchShops = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    deletePartnerApplication: mockDeletePartnerApplication,
    getPartnerApplication: mockGetPartnerApplication,
    getPartnerApplications: mockGetPartnerApplications,
    patchPartnerApplication: mockPatchPartnerApplication,
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

    it("loads a specific partner application from the detail endpoint", async () => {
        mockGetPartnerApplication.mockResolvedValue({
            data: {
                id: "app-detail",
                applicantUserId: "user-1",
                businessState: "IN_REVIEW",
                executionState: "WAITING",
                payload: {
                    type: "NEW",
                    shopName: "Detail Shop",
                    shopType: "COMMERCIAL_DEALER",
                    shopDomains: ["detail.example.com"],
                    shopUrl: "https://detail.example.com",
                },
                created: "2024-01-01T00:00:00Z",
                updated: "2024-01-02T00:00:00Z",
            },
            error: null,
        });

        const { result } = renderHook(() => usePartnerApplicationDetails("app-detail"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockGetPartnerApplication).toHaveBeenCalledWith({
            path: { partnerApplicationId: "app-detail" },
        });
        expect(result.current.data).toEqual(
            expect.objectContaining({
                id: "app-detail",
                businessState: "IN_REVIEW",
                payload: expect.objectContaining({
                    type: "NEW",
                    shopName: "Detail Shop",
                    shopUrl: "https://detail.example.com",
                }),
            }),
        );
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
            shopStructuredAddress: null,
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
                shopStructuredAddress: null,
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

    it("deletes a partner application and refreshes related queries", async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
        queryClient.setQueryData(PARTNER_APPLICATIONS_QUERY_KEY, [
            { id: "app-deleted" },
            { id: "app-kept" },
        ]);
        mockDeletePartnerApplication.mockResolvedValue({
            data: undefined,
            error: null,
        });

        const { result } = renderHook(() => useDeletePartnerApplication(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("app-deleted");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockDeletePartnerApplication).toHaveBeenCalledWith({
            path: { partnerApplicationId: "app-deleted" },
        });
        expect(queryClient.getQueryData(PARTNER_APPLICATIONS_QUERY_KEY)).toEqual([
            { id: "app-kept" },
        ]);
        expect(
            queryClient.getQueryState([...PARTNER_APPLICATIONS_QUERY_KEY, "detail", "app-deleted"]),
        ).toBeUndefined();
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: PARTNER_APPLICATIONS_QUERY_KEY,
        });
    });

    it("updates a partner application and refreshes related queries", async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
        queryClient.setQueryData(PARTNER_APPLICATIONS_QUERY_KEY, [
            {
                id: "app-updated",
                updated: new Date("2024-01-01T00:00:00Z"),
            },
        ]);
        mockPatchPartnerApplication.mockResolvedValue({
            data: {
                id: "app-updated",
                applicantUserId: "user-1",
                businessState: "SUBMITTED",
                executionState: "PROCESSING",
                payload: {
                    type: "NEW",
                    shopName: "Updated Shop",
                    shopType: "MARKETPLACE",
                    shopDomains: ["updated.example.com"],
                    shopPhone: "+49 30 123456",
                },
                created: "2024-01-01T00:00:00Z",
                updated: "2024-01-03T00:00:00Z",
            },
            error: null,
        });

        const { result } = renderHook(() => useUpdatePartnerApplication(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            partnerApplicationId: "app-updated",
            shopName: "Updated Shop",
            shopType: "MARKETPLACE",
            shopDomains: ["updated.example.com"],
            shopPhone: "+49 30 123456",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPatchPartnerApplication).toHaveBeenCalledWith({
            path: { partnerApplicationId: "app-updated" },
            body: {
                shopName: "Updated Shop",
                shopType: "MARKETPLACE",
                shopDomains: ["updated.example.com"],
                shopPhone: "+49 30 123456",
            },
        });
        expect(queryClient.getQueryData(PARTNER_APPLICATIONS_QUERY_KEY)).toEqual([
            expect.objectContaining({
                id: "app-updated",
                payload: expect.objectContaining({
                    type: "NEW",
                    shopName: "Updated Shop",
                }),
            }),
        ]);
        expect(queryClient.getQueryData(partnerApplicationDetailQueryKey("app-updated"))).toEqual(
            expect.objectContaining({ id: "app-updated" }),
        );
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: PARTNER_APPLICATIONS_QUERY_KEY,
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: partnerApplicationDetailQueryKey("app-updated"),
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
