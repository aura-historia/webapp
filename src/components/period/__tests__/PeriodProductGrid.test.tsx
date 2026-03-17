import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PeriodProductGrid } from "../PeriodProductGrid.tsx";
import { usePeriodProducts } from "@/hooks/period/usePeriodProducts.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { PeriodProductsPage } from "@/hooks/period/usePeriodProducts.ts";
import type { InfiniteData } from "@tanstack/react-query";

vi.mock("@/hooks/period/usePeriodProducts.ts", () => ({
    usePeriodProducts: vi.fn(),
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: true }),
}));

vi.mock("@/components/product/grid/ProductGridItem.tsx", () => ({
    ProductGridItem: ({ product }: { product: OverviewProduct }) => (
        <div data-testid="product-grid-item">{product.title}</div>
    ),
}));

vi.mock("@/components/product/grid/ProductGridItemSkeleton.tsx", () => ({
    ProductGridItemSkeleton: () => <div data-testid="product-grid-item-skeleton" />,
}));

vi.mock("@/components/common/ListLoaderRow.tsx", () => ({
    ListLoaderRow: ({
        loadingMoreKey,
        allLoadedKey,
    }: {
        loadingMoreKey: string;
        allLoadedKey: string;
    }) => (
        <div data-testid="list-loader-row">
            <span>{loadingMoreKey}</span>
            <span>{allLoadedKey}</span>
        </div>
    ),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockUsePeriodProducts = vi.mocked(usePeriodProducts);

const baseProduct: OverviewProduct = {
    productId: "p1",
    productSlugId: "product-1",
    eventId: "e1",
    shopId: "s1",
    shopSlugId: "shop-1",
    shopsProductId: "si1",
    shopName: "Test Shop",
    shopType: "AUCTION_HOUSE",
    title: "Ancient Vase",
    description: undefined,
    price: "100 €",
    state: "AVAILABLE",
    url: null,
    images: [],
    created: new Date("2024-01-01"),
    updated: new Date("2024-06-01"),
    originYear: undefined,
    originYearMin: undefined,
    originYearMax: undefined,
    authenticity: "UNKNOWN",
    condition: "UNKNOWN",
    provenance: "UNKNOWN",
    restoration: "UNKNOWN",
};

function buildInfiniteData(pages: PeriodProductsPage[]): InfiniteData<PeriodProductsPage> {
    return {
        pages,
        pageParams: pages.map((_, i) => (i === 0 ? undefined : `cursor-${i}`)),
    };
}

type MockOptions = {
    isLoading?: boolean;
    error?: Error | null;
    products?: OverviewProduct[];
    total?: number;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

function setMock({
    isLoading = false,
    error = null,
    products = [],
    total,
    hasNextPage = false,
    isFetchingNextPage = false,
}: MockOptions = {}) {
    const resolvedTotal = total ?? products.length;
    mockUsePeriodProducts.mockReturnValue({
        data: isLoading
            ? undefined
            : buildInfiniteData([{ products, total: resolvedTotal, searchAfter: undefined }]),
        isLoading,
        isError: !!error,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof usePeriodProducts>);
}

describe("PeriodProductGrid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    it("renders skeleton loaders while loading", () => {
        setMock({ isLoading: true });
        renderWithQueryClient(<PeriodProductGrid periodId="renaissance" />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders an error state when the hook returns an error", () => {
        setMock({ error: new Error("load failed") });
        renderWithQueryClient(<PeriodProductGrid periodId="renaissance" />);
        expect(screen.getByText("period.products.error.title")).toBeInTheDocument();
        expect(screen.getByText("period.products.error.description")).toBeInTheDocument();
    });

    it("renders the no-results state when products list is empty", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<PeriodProductGrid periodId="renaissance" />);
        expect(screen.getByText("period.products.noResults.title")).toBeInTheDocument();
        expect(screen.getByText("period.products.noResults.description")).toBeInTheDocument();
    });

    it("renders product items for returned products", () => {
        setMock({
            products: [
                { ...baseProduct, productId: "p1", shopsProductId: "si1", title: "Ancient Vase" },
                { ...baseProduct, productId: "p2", shopsProductId: "si2", title: "Roman Coin" },
            ],
            total: 2,
        });
        renderWithQueryClient(<PeriodProductGrid periodId="renaissance" />);
        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
        expect(screen.getAllByTestId("product-grid-item")).toHaveLength(2);
    });

    it("renders the ListLoaderRow when products are loaded", () => {
        setMock({
            products: [{ ...baseProduct, productId: "p1", title: "Ancient Vase" }],
            total: 1,
            hasNextPage: false,
            isFetchingNextPage: false,
        });
        renderWithQueryClient(<PeriodProductGrid periodId="renaissance" />);
        expect(screen.getByTestId("list-loader-row")).toBeInTheDocument();
        expect(screen.getByText("period.products.loadingMore")).toBeInTheDocument();
        expect(screen.getByText("period.products.allLoaded")).toBeInTheDocument();
    });

    it("calls usePeriodProducts with the provided periodId", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<PeriodProductGrid periodId="baroque" />);
        expect(mockUsePeriodProducts).toHaveBeenCalledWith("baroque");
    });
});
