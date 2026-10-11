import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { productListingHistoryQueryOptions } from "../productListingHistoryQuery.ts";

const mockGetProductListingHistory = vi.hoisted(() => vi.fn());

vi.mock("@/client/sdk.gen", async () => {
    const actual = await vi.importActual<typeof import("@/client/sdk.gen")>("@/client/sdk.gen");
    return { ...actual, getProductListingHistory: mockGetProductListingHistory };
});

describe("productListingHistoryQueryOptions", () => {
    beforeEach(() => {
        mockGetProductListingHistory.mockReset();
        mockGetProductListingHistory.mockResolvedValue({ data: [] });
    });

    it("keeps source-only and each requested currency in separate cache entries", () => {
        const keys = [undefined, "EUR", "RON", "KRW"].map((currency) =>
            JSON.stringify(
                productListingHistoryQueryOptions("pl_123", currency as "EUR" | undefined).queryKey,
            ),
        );

        expect(new Set(keys).size).toBe(4);
        expect(productListingHistoryQueryOptions("pl_123").queryKey[0]).not.toHaveProperty("query");
        expect(productListingHistoryQueryOptions("pl_123", "RON").queryKey[0]).toMatchObject({
            path: { productListingId: "pl_123" },
            query: { currency: "RON" },
        });
    });

    it("forwards the requested currency and omits it for source-only history", async () => {
        const queryClient = new QueryClient();

        await queryClient.fetchQuery(productListingHistoryQueryOptions("pl_123", "KRW"));
        await queryClient.fetchQuery(productListingHistoryQueryOptions("pl_123"));

        expect(mockGetProductListingHistory).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                path: { productListingId: "pl_123" },
                query: { currency: "KRW" },
            }),
        );
        expect(mockGetProductListingHistory.mock.calls[1]?.[0]).not.toHaveProperty("query");
    });

    it("never serves cached history for one currency to another", async () => {
        const queryClient = new QueryClient();
        await queryClient.fetchQuery(productListingHistoryQueryOptions("pl_123", "EUR"));

        expect(
            queryClient.getQueryData(productListingHistoryQueryOptions("pl_123", "RON").queryKey),
        ).toBeUndefined();
        expect(
            queryClient.getQueryData(productListingHistoryQueryOptions("pl_123").queryKey),
        ).toBeUndefined();
    });
});
