import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWatchlistQueryKey, useWatchlist } from "../useWatchlist.ts";

const mockGetWatchlist = vi.hoisted(() => vi.fn());
const mockPreferences = vi.hoisted(() => ({ currency: "EUR" }));

vi.mock("@/client", () => ({ getWatchlistProductListings: mockGetWatchlist }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: (error: Error) => error.message }),
}));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { language: "en" } }),
}));
vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: mockPreferences }),
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "user-1" }, isLoading: false }),
}));

describe("useWatchlist", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
    const cursor: [string, string] = ["2026-09-29T10:00:00Z", "listing-2"];

    beforeEach(() => {
        vi.clearAllMocks();
        mockPreferences.currency = "EUR";
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        mockGetWatchlist.mockResolvedValue({
            data: { items: [], size: 0, searchAfter: cursor },
            error: null,
        });
    });

    it("serializes the tuple cursor and stops when the server repeats it", async () => {
        const { result } = renderHook(() => useWatchlist(), { wrapper });

        await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
        await result.current.fetchNextPage();

        await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
        expect(mockGetWatchlist).toHaveBeenLastCalledWith({
            query: {
                language: "en",
                currency: "EUR",
                searchAfter: JSON.stringify(cursor),
                size: 20,
            },
        });
        expect(result.current.hasNextPage).toBe(false);
    });

    it("partitions authenticated watchlist pages by account", () => {
        expect(getWatchlistQueryKey("user-1", "en", "EUR")).not.toEqual(
            getWatchlistQueryKey("user-2", "en", "EUR"),
        );
        expect(getWatchlistQueryKey(undefined, "en", "EUR")).not.toEqual(
            getWatchlistQueryKey("user-1", "en", "EUR"),
        );
    });

    it.each([
        ["KRW", 1_500_000, "₩1,500,000"],
        ["SEK", 1_234_550, "SEK 12,345.50"],
    ] as const)(
        "requests and formats %s watchlist display prices",
        async (currency, amount, text) => {
            mockPreferences.currency = currency;
            mockGetWatchlist.mockResolvedValue({
                data: {
                    items: [
                        {
                            item: {
                                productListingId: "listing-1",
                                eventId: "evt-1",
                                source: {
                                    listingSourceId: "source-1",
                                    name: "Shop",
                                    slugId: "shop",
                                },
                                sourceListingId: "item-1",
                                title: { text: "Vase", language: "en" },
                                pricing: {
                                    source: {
                                        price: {
                                            type: "MONETARY",
                                            amount: 100000,
                                            currency: "EUR",
                                        },
                                    },
                                    display: { price: { type: "MONETARY", amount, currency } },
                                    valuation: {
                                        type: "CURRENT",
                                        fxRateId: "fx-1",
                                        capturedAt: "2026-09-29T10:00:00Z",
                                    },
                                },
                                availability: "AVAILABLE",
                                lifecycle: "ACTIVE",
                                url: "https://example.com/vase",
                                images: [],
                                auction: null,
                                lot: null,
                                created: "2026-09-01T00:00:00Z",
                                updated: "2026-09-29T10:00:00Z",
                            },
                        },
                    ],
                    size: 1,
                    searchAfter: null,
                },
                error: null,
            });

            const { result } = renderHook(() => useWatchlist(), { wrapper });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockGetWatchlist.mock.calls[0]?.[0].query.currency).toBe(currency);
            const product = result.current.data?.pages[0]?.products[0];
            expect(product?.price).toEqual({ type: "MONETARY", amount, currency });
            expect(product?.formattedPrice?.replace(/[\u00a0\u202f]/g, " ")).toBe(text);
            expect(getWatchlistQueryKey("user-1", "en", currency)).not.toEqual(
                getWatchlistQueryKey("user-1", "en", "EUR"),
            );
        },
    );
});
