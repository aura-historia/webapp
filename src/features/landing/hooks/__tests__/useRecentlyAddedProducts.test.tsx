import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import {
    ENRICHMENT_LAG_MS,
    enrichedCreatedCutoff,
    RECENTLY_ADDED_COUNT,
    useRecentlyAddedProducts,
} from "../useRecentlyAddedProducts.ts";

const mockSimpleSearchProductListings = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    simpleSearchProductListings: mockSimpleSearchProductListings,
}));

vi.mock("@/data/internal/product/ProductListing.ts", () => ({
    mapPersonalizedProductListingSummary: (product: unknown) => product,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { language: "de" } }),
}));

const HOUR_MS = 60 * 60 * 1000;

describe("enrichedCreatedCutoff", () => {
    it("is at least the enrichment lag before now", () => {
        const now = Date.parse("2026-11-27T15:06:16.000Z");

        const cutoff = Date.parse(enrichedCreatedCutoff(now));

        expect(now - cutoff).toBeGreaterThanOrEqual(ENRICHMENT_LAG_MS);
        expect(now - cutoff).toBeLessThan(ENRICHMENT_LAG_MS + HOUR_MS);
    });

    it("rounds down to the full hour", () => {
        expect(enrichedCreatedCutoff(Date.parse("2026-11-27T15:06:16.000Z"))).toBe(
            "2026-11-26T15:00:00.000Z",
        );
    });

    it("stays the same within one hour", () => {
        expect(enrichedCreatedCutoff(Date.parse("2026-11-27T15:00:00.000Z"))).toBe(
            enrichedCreatedCutoff(Date.parse("2026-11-27T15:59:59.999Z")),
        );
    });

    it("moves to the next hour on the hour", () => {
        expect(enrichedCreatedCutoff(Date.parse("2026-11-27T16:00:00.000Z"))).toBe(
            "2026-11-26T16:00:00.000Z",
        );
    });
});

describe("useRecentlyAddedProducts", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) => (
        <UserPreferencesProvider locale="de-DE">
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </UserPreferencesProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-11-27T15:06:16.000Z"));
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("asks for the newest listings that are at least a day old", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({ data: { items: [] } });

        const { result } = renderHook(() => useRecentlyAddedProducts(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mockSimpleSearchProductListings).toHaveBeenCalledTimes(1);
        expect(mockSimpleSearchProductListings).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({
                    sort: "created",
                    order: "desc",
                    size: RECENTLY_ADDED_COUNT,
                    created: { max: "2026-11-26T15:00:00.000Z" },
                    language: "de",
                }),
                throwOnError: true,
            }),
        );
    });

    it("returns the listings in the order the API sorted them", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: { items: [{ id: "newer" }, { id: "older" }] },
        });

        const { result } = renderHook(() => useRecentlyAddedProducts(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ id: "newer" }, { id: "older" }]);
    });
});
