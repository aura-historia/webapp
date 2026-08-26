import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestRouterWrapper } from "@/test/utils.tsx";
import { useDealerProducts } from "../useDealerProducts.ts";

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

describe("useDealerProducts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("fetches and returns products for the given shop, excluding the current product", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: {
                items: [{ productId: "p1" }, { productId: "p2" }],
                total: 2,
                searchAfter: undefined,
            },
            error: null,
        });

        const { result } = renderHook(() => useDealerProducts("Christie's", "current-product"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toHaveLength(2);
    });

    it("calls simpleSearchProducts with shopName, excludeProductId and defaults", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: { items: [], total: 0, searchAfter: undefined },
            error: null,
        });

        renderHook(() => useDealerProducts("Christie's", "current-product"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(mockSimpleSearchProducts).toHaveBeenCalledTimes(1));

        expect(mockSimpleSearchProducts).toHaveBeenCalledWith({
            query: expect.objectContaining({
                language: "de",
                currency: "EUR",
                size: 8,
                sort: "updated",
                order: "desc",
                shopName: ["Christie's"],
                excludeProductId: ["current-product"],
            }),
        });
    });

    it("throws an error mapped via getErrorMessage when API returns an error", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: null,
            error: { message: "Server Error" },
        });
        mockGetErrorMessage.mockReturnValue("Mapped Server Error");

        const { result } = renderHook(() => useDealerProducts("Christie's", "current-product"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Mapped Server Error");
    });

    it("returns an empty array when items is undefined", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: { items: undefined, total: 0, searchAfter: undefined },
            error: null,
        });

        const { result } = renderHook(() => useDealerProducts("Empty Shop", "current-product"), {
            wrapper: TestRouterWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual([]);
    });
});
