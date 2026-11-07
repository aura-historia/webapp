import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { TestRouterWrapper } from "@/test/utils.tsx";
import { useShopProducts } from "../useShopProducts.ts";

const mockSimpleSearchProductListings = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    simpleSearchProductListings: mockSimpleSearchProductListings,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@/data/internal/product/ProductListing.ts", () => ({
    mapPersonalizedProductListingSummary: (product: unknown) => product,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: { language: "de" },
    }),
}));

vi.mock("@/data/internal/common/Language.ts", () => ({
    parseLanguage: (lang: string) => lang,
}));

/** One query client for the whole hook lifetime, so rerenders keep the cache and the observer. */
function createStableWrapper() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return function StableWrapper({ children }: { children: ReactNode }) {
        return (
            <UserPreferencesProvider locale="de-DE">
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </UserPreferencesProvider>
        );
    };
}

describe("useShopProducts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("fetches and returns products for the given shopName", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: {
                items: [{ productId: "p1" }, { productId: "p2" }],
                total: 2,
                searchAfter: undefined,
            },
            error: null,
        });

        const { result } = renderHook(() => useShopProducts("ls_1"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const page = result.current.data?.pages[0];
        expect(page?.products).toHaveLength(2);
        expect(page?.total).toBe(2);
        expect(page?.searchAfter).toBeUndefined();
    });

    it("calls simpleSearchProductListings with the correct shopName and defaults", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: { items: [], total: 0, searchAfter: undefined },
            error: null,
        });

        renderHook(() => useShopProducts("ls_1"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(mockSimpleSearchProductListings).toHaveBeenCalledTimes(1));

        expect(mockSimpleSearchProductListings).toHaveBeenCalledWith({
            query: expect.objectContaining({
                language: "de",
                currency: "EUR",
                size: 20,
                sort: "updated",
                order: "desc",
                listingSourceId: ["ls_1"],
            }),
        });
        expect(mockSimpleSearchProductListings.mock.calls[0][0].query.productQuery).toBeUndefined();
    });

    it("searches the source's listings by relevance when a query is given", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: { items: [], total: 0, searchAfter: undefined },
            error: null,
        });

        renderHook(() => useShopProducts("ls_1", "vase"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(mockSimpleSearchProductListings).toHaveBeenCalledTimes(1));

        expect(mockSimpleSearchProductListings).toHaveBeenCalledWith({
            query: expect.objectContaining({
                sort: "score",
                order: "desc",
                listingSourceId: ["ls_1"],
                productQuery: ["vase"],
            }),
        });
    });

    it("refetches when the query changes", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: { items: [], total: 0, searchAfter: undefined },
            error: null,
        });

        const { rerender } = renderHook(({ query }) => useShopProducts("ls_1", query), {
            wrapper: createStableWrapper(),
            initialProps: { query: "" },
        });
        await waitFor(() => expect(mockSimpleSearchProductListings).toHaveBeenCalledTimes(1));

        rerender({ query: "lamp" });

        await waitFor(() => expect(mockSimpleSearchProductListings).toHaveBeenCalledTimes(2));
        expect(mockSimpleSearchProductListings.mock.calls[1][0].query).toEqual(
            expect.objectContaining({ sort: "score", productQuery: ["lamp"] }),
        );
    });

    it("sends the cursor of the previous page for the next page", async () => {
        mockSimpleSearchProductListings.mockResolvedValueOnce({
            data: {
                items: [{ productId: "p1" }],
                total: 2,
                searchAfter: { fxRateId: "fx-1", searchAfter: ["cursor-value"] },
            },
            error: null,
        });
        mockSimpleSearchProductListings.mockResolvedValueOnce({
            data: { items: [{ productId: "p2" }], total: 2, searchAfter: undefined },
            error: null,
        });

        const { result } = renderHook(() => useShopProducts("ls_1", "vase"), {
            wrapper: createStableWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Assert on the returned result: the hook result only re-renders for properties read before.
        let next: Awaited<ReturnType<typeof result.current.fetchNextPage>> | undefined;
        await act(async () => {
            next = await result.current.fetchNextPage();
        });

        expect(mockSimpleSearchProductListings).toHaveBeenCalledTimes(2);
        expect(mockSimpleSearchProductListings.mock.calls[0][0].query.searchAfter).toBeUndefined();
        expect(mockSimpleSearchProductListings.mock.calls[1][0].query).toEqual(
            expect.objectContaining({
                searchAfter: JSON.stringify({ fxRateId: "fx-1", searchAfter: ["cursor-value"] }),
                productQuery: ["vase"],
            }),
        );
        expect(next?.data?.pages).toHaveLength(2);
        expect(next?.hasNextPage).toBe(false);
    });

    it("throws an error mapped via getErrorMessage when API returns an error", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: null,
            error: { message: "Server Error" },
        });
        mockGetErrorMessage.mockReturnValue("Mapped Server Error");

        const { result } = renderHook(() => useShopProducts("ls_1"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Mapped Server Error");
    });

    it("returns an empty products array when items is undefined", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: { items: undefined, total: 0, searchAfter: undefined },
            error: null,
        });

        const { result } = renderHook(() => useShopProducts("Empty Shop"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.pages[0]?.products).toEqual([]);
    });

    it("provides searchAfter as the next page param", async () => {
        mockSimpleSearchProductListings.mockResolvedValue({
            data: {
                items: [{ productId: "p1" }],
                total: 10,
                searchAfter: { fxRateId: "fx-1", searchAfter: ["cursor-value"] },
            },
            error: null,
        });

        const { result } = renderHook(() => useShopProducts("ls_1"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.pages[0]?.searchAfter).toEqual({
            fxRateId: "fx-1",
            searchAfter: ["cursor-value"],
        });
        expect(result.current.hasNextPage).toBe(true);
    });
});
