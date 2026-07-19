import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PARTNER_SHOPS_QUERY_KEY } from "../useMyPartnerShops.ts";
import { usePatchMyPartnerShop } from "../usePatchMyPartnerShop.ts";

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

describe("usePatchMyPartnerShop", () => {
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

    it("patches a shop and replaces it in the cached partner-shops list", async () => {
        const existingShop = {
            shopId: "shop-1",
            shopSlugId: "aurora-antiques",
            name: "Aurora Antiques",
            shopType: "AUCTION_HOUSE" as const,
            partnerStatus: "PARTNERED" as const,
            domains: ["old.example.com"],
            created: new Date("2026-04-25T00:00:00Z"),
            updated: new Date("2026-04-25T00:00:00Z"),
        };
        const updatedShop = {
            shopId: "shop-1",
            shopSlugId: "aurora-antiques",
            name: "Aurora Antiques",
            shopType: "MARKETPLACE",
            partnerStatus: "PARTNERED",
            domains: ["new.example.com"],
            shopifyDomain: "new.myshopify.com",
            shopifyCurrency: "EUR",
            shopifyLanguage: "de",
            woocommerceCurrency: "USD",
            woocommerceLanguage: "en",
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
            created: "2026-04-25T00:00:00Z",
            updated: "2026-04-26T00:00:00Z",
        };

        mockPatchShopById.mockResolvedValue({ data: updatedShop, error: null });
        queryClient.setQueryData(PARTNER_SHOPS_QUERY_KEY, [existingShop]);

        const { result } = renderHook(() => usePatchMyPartnerShop(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.mutateAsync({
                shopId: "shop-1",
                shopType: "MARKETPLACE",
                domains: ["new.example.com"],
                shopifyDomain: "new.myshopify.com",
                shopifyCurrency: "EUR",
                shopifyLanguage: "de",
                woocommerceCurrency: "USD",
                woocommerceLanguage: "en",
                url: "https://new.example.com",
                image: null,
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                },
                phone: "+49 30 123456",
                email: "info@example.com",
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPatchShopById).toHaveBeenCalledWith({
            path: { shopId: "shop-1" },
            body: {
                shopType: "MARKETPLACE",
                domains: ["new.example.com"],
                shopifyDomain: "new.myshopify.com",
                shopifyCurrency: "EUR",
                shopifyLanguage: "de",
                woocommerceCurrency: "USD",
                woocommerceLanguage: "en",
                url: "https://new.example.com",
                image: null,
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                },
                phone: "+49 30 123456",
                email: "info@example.com",
            },
        });

        const cached =
            queryClient.getQueryData<Array<{ shopId: string; shopType?: string }>>(
                PARTNER_SHOPS_QUERY_KEY,
            );
        expect(cached?.[0]).toMatchObject({ shopId: "shop-1", shopType: "MARKETPLACE" });
    });

    it("shows an error toast when patching fails", async () => {
        mockPatchShopById.mockResolvedValue({
            data: null,
            error: { message: "Forbidden" },
        });
        mockGetErrorMessage.mockReturnValue("Forbidden");

        const { result } = renderHook(() => usePatchMyPartnerShop(), {
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
        expect(mockToast.error).toHaveBeenCalledWith("Forbidden");
    });
});
