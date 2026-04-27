import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminShopPage } from "../useAdminShops.ts";
import { useCreateAdminShop } from "../useCreateAdminShop.ts";

const mockPostShop = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    postShop: mockPostShop,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

describe("useCreateAdminShop", () => {
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

    it("creates a shop and updates matching cached admin shop lists", async () => {
        const createdShop = {
            shopId: "shop-1",
            shopSlugId: "new-shop",
            name: "New Shop",
            shopType: "AUCTION_HOUSE",
            partnerStatus: "SCRAPED",
            domains: ["example.com"],
            image: "https://example.com/logo.png",
            created: "2026-04-25T00:00:00Z",
            updated: "2026-04-25T00:00:00Z",
        };

        mockPostShop.mockResolvedValue({
            data: createdShop,
            error: null,
        });

        queryClient.setQueryData(["admin", "shops", { partnerStatus: ["SCRAPED"] }], {
            pageParams: [undefined],
            pages: [
                {
                    items: [],
                    searchAfter: undefined,
                    total: 0,
                } satisfies AdminShopPage,
            ],
        });

        queryClient.setQueryData(["admin", "shops", { nameQuery: "other" }], {
            pageParams: [undefined],
            pages: [
                {
                    items: [],
                    searchAfter: undefined,
                    total: 0,
                } satisfies AdminShopPage,
            ],
        });

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useCreateAdminShop(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.mutateAsync({
                name: "New Shop",
                shopType: "AUCTION_HOUSE",
                domains: ["example.com"],
                image: "https://example.com/logo.png",
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPostShop).toHaveBeenCalledWith({
            body: {
                name: "New Shop",
                shopType: "AUCTION_HOUSE",
                domains: ["example.com"],
                image: "https://example.com/logo.png",
            },
        });

        const matchingCache = queryClient.getQueryData<{
            pages: AdminShopPage[];
        }>(["admin", "shops", { partnerStatus: ["SCRAPED"] }]);
        expect(matchingCache?.pages[0]?.items).toHaveLength(1);
        expect(matchingCache?.pages[0]?.items[0]).toMatchObject({
            shopId: "shop-1",
            name: "New Shop",
        });
        expect(matchingCache?.pages[0]?.total).toBe(1);

        const nonMatchingCache = queryClient.getQueryData<{
            pages: AdminShopPage[];
        }>(["admin", "shops", { nameQuery: "other" }]);
        expect(nonMatchingCache?.pages[0]?.items).toHaveLength(0);

        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ["admin", "shops"],
            refetchType: "none",
        });
    });

    it("passes optional metadata fields in the create payload", async () => {
        const createdShop = {
            shopId: "shop-2",
            shopSlugId: "metadata-shop",
            name: "Metadata Shop",
            shopType: "MARKETPLACE",
            partnerStatus: "SCRAPED",
            domains: ["metadata.example.com"],
            image: null,
            structuredAddress: {
                addressline: "Main Street 1",
                locality: "Berlin",
                country: "DE",
                continent: "EUROPE",
            },
            phone: "+49 30 123456",
            email: "info@metadata.example.com",
            specialitiesCategories: ["furniture"],
            specialitiesPeriods: ["baroque"],
            created: "2026-04-25T00:00:00Z",
            updated: "2026-04-25T00:00:00Z",
        };

        mockPostShop.mockResolvedValue({
            data: createdShop,
            error: null,
        });

        const { result } = renderHook(() => useCreateAdminShop(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.mutateAsync({
                name: "Metadata Shop",
                shopType: "MARKETPLACE",
                domains: ["metadata.example.com"],
                image: null,
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                },
                phone: "+49 30 123456",
                email: "info@metadata.example.com",
                specialitiesCategories: ["furniture"],
                specialitiesPeriods: ["baroque"],
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPostShop).toHaveBeenCalledWith({
            body: {
                name: "Metadata Shop",
                shopType: "MARKETPLACE",
                domains: ["metadata.example.com"],
                image: null,
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                    continent: undefined,
                },
                phone: "+49 30 123456",
                email: "info@metadata.example.com",
                specialitiesCategories: ["furniture"],
                specialitiesPeriods: ["baroque"],
            },
        });
    });

    it("shows an error toast when shop creation fails", async () => {
        mockPostShop.mockResolvedValue({
            data: null,
            error: { message: "Shop exists already" },
        });
        mockGetErrorMessage.mockReturnValue("Shop exists already");

        const { result } = renderHook(() => useCreateAdminShop(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            try {
                await result.current.mutateAsync({
                    name: "New Shop",
                    shopType: "AUCTION_HOUSE",
                    domains: ["example.com"],
                    image: null,
                });
            } catch {
                // expected
            }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(mockToast.error).toHaveBeenCalledWith("Shop exists already");
    });
});
