import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminShopPage } from "../useAdminShops.ts";
import { usePatchAdminShop } from "../usePatchAdminShop.ts";

const mockPatchShopById = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock("@/client", () => ({
    patchShopById: mockPatchShopById,
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

describe("usePatchAdminShop", () => {
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

    it("patches shop metadata and keeps the server-confirmed response in cached admin lists", async () => {
        const existingShop = {
            shopId: "shop-1",
            shopSlugId: "existing-shop",
            name: "Existing Shop",
            shopType: "AUCTION_HOUSE" as const,
            partnerStatus: "SCRAPED" as const,
            domains: ["old.example.com"],
            created: new Date("2026-04-25T00:00:00Z"),
            updated: new Date("2026-04-25T00:00:00Z"),
        };
        const updatedShop = {
            shopId: "shop-1",
            shopSlugId: "existing-shop",
            name: "Existing Shop",
            shopType: "MARKETPLACE",
            partnerStatus: "SCRAPED",
            domains: ["new.example.com"],
            url: "https://new.example.com",
            image: null,
            structuredAddress: {
                addressline: "Main Street 1",
                locality: "Berlin",
                country: "DE",
                continent: "EUROPE",
            },
            phone: "+49 30 123456",
            email: "info@example.com",
            specialitiesCategories: ["furniture"],
            specialitiesPeriods: ["baroque"],
            created: "2026-04-25T00:00:00Z",
            updated: "2026-04-26T00:00:00Z",
        };

        mockPatchShopById.mockResolvedValue({
            data: updatedShop,
            error: null,
        });

        queryClient.setQueryData(["admin", "shops", {}], {
            pageParams: [undefined],
            pages: [
                {
                    items: [existingShop],
                    searchAfter: undefined,
                    total: 1,
                } satisfies AdminShopPage,
            ],
        });

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => usePatchAdminShop(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.mutateAsync({
                shopId: "shop-1",
                shopType: "MARKETPLACE",
                domains: ["new.example.com"],
                url: "https://new.example.com",
                image: null,
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                },
                phone: "+49 30 123456",
                email: "info@example.com",
                specialitiesCategories: ["furniture"],
                specialitiesPeriods: ["baroque"],
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPatchShopById).toHaveBeenCalledWith({
            path: { shopId: "shop-1" },
            body: {
                shopType: "MARKETPLACE",
                domains: ["new.example.com"],
                url: "https://new.example.com",
                image: null,
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                    continent: undefined,
                },
                phone: "+49 30 123456",
                email: "info@example.com",
                specialitiesCategories: ["furniture"],
                specialitiesPeriods: ["baroque"],
            },
        });

        const cache = queryClient.getQueryData<{ pages: AdminShopPage[] }>(["admin", "shops", {}]);
        expect(cache?.pages[0]?.items[0]).toMatchObject({
            shopId: "shop-1",
            shopType: "MARKETPLACE",
            domains: ["new.example.com"],
            url: "https://new.example.com",
            phone: "+49 30 123456",
            email: "info@example.com",
            specialitiesCategories: ["furniture"],
            specialitiesPeriods: ["baroque"],
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ["admin", "shops"],
            refetchType: "none",
        });
    });

    it("shows an error toast when shop patching fails", async () => {
        mockPatchShopById.mockResolvedValue({
            data: null,
            error: { message: "Shop not found" },
        });
        mockGetErrorMessage.mockReturnValue("Shop not found");

        const { result } = renderHook(() => usePatchAdminShop(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            try {
                await result.current.mutateAsync({
                    shopId: "shop-1",
                    domains: ["example.com"],
                });
            } catch {
                // expected
            }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(mockToast.error).toHaveBeenCalledWith("Shop not found");
    });
});
