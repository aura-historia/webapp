import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCombinationProducts } from "../useCombinationProducts.ts";

const mockSimpleSearchProducts = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    simpleSearchProducts: mockSimpleSearchProducts,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@/data/internal/product/OverviewProduct.ts", () => ({
    mapPersonalizedGetProductSummaryDataToOverviewProduct: (product: unknown) => product,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: { language: "de" },
    }),
}));

vi.mock("@/data/internal/common/Language.ts", () => ({
    parseLanguage: (lang: string) => lang,
}));

describe("useCombinationProducts", () => {
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

    it("fetches and returns products for the given categoryId and periodId", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: {
                items: [{ productId: "p1" }, { productId: "p2" }],
                total: 2,
                searchAfter: undefined,
            },
            error: null,
        });

        const { result } = renderHook(() => useCombinationProducts("furniture", "biedermeier"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const page = result.current.data?.pages[0];
        expect(page?.products).toHaveLength(2);
        expect(page?.total).toBe(2);
        expect(page?.searchAfter).toBeUndefined();
    });

    it("calls simpleSearchProducts with both categoryId and periodId", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: { items: [], total: 0, searchAfter: undefined },
            error: null,
        });

        renderHook(() => useCombinationProducts("furniture", "biedermeier"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(mockSimpleSearchProducts).toHaveBeenCalledTimes(1));

        expect(mockSimpleSearchProducts).toHaveBeenCalledWith({
            query: expect.objectContaining({
                language: "de",
                currency: "EUR",
                categoryId: ["furniture"],
                periodId: ["biedermeier"],
                size: 20,
                sort: "updated",
                order: "desc",
            }),
        });
    });

    it("throws an error mapped via getErrorMessage when API returns an error", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: null,
            error: { message: "Server Error" },
        });
        mockGetErrorMessage.mockReturnValue("Mapped Server Error");

        const { result } = renderHook(() => useCombinationProducts("furniture", "biedermeier"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Mapped Server Error");
    });

    it("returns an empty products array when items is undefined", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: { items: undefined, total: 0, searchAfter: undefined },
            error: null,
        });

        const { result } = renderHook(
            () => useCombinationProducts("coins-currency-medals", "antiquity"),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.pages[0]?.products).toEqual([]);
    });
});
