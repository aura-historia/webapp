import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShopProductGrid } from "../ShopProductGrid.tsx";
import { useShopProducts } from "@/hooks/shop/useShopProducts.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { ShopProductsPage } from "@/hooks/shop/useShopProducts.ts";
import type { InfiniteData } from "@tanstack/react-query";

vi.mock("@/hooks/shop/useShopProducts.ts", () => ({
    useShopProducts: vi.fn(),
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    default: () => <div data-testid="lottie-animation" />,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

vi.mock("@/components/product/buttons/NotificationButton", () => ({
    NotificationButton: () => (
        <button type="button" data-testid="notification-button">
            Notification
        </button>
    ),
}));

const mockUseShopProducts = vi.mocked(useShopProducts);

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

function buildInfiniteData(pages: ShopProductsPage[]): InfiniteData<ShopProductsPage> {
    return {
        pages,
        pageParams: pages.map((_, i) => (i === 0 ? undefined : `cursor-${i}`)),
    };
}

type MockOptions = {
    isPending?: boolean;
    error?: Error | null;
    products?: OverviewProduct[];
    total?: number;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

function setMock({
    isPending = false,
    error = null,
    products = [],
    total,
    hasNextPage = false,
    isFetchingNextPage = false,
}: MockOptions = {}) {
    const resolvedTotal = total ?? products.length;
    mockUseShopProducts.mockReturnValue({
        data: isPending
            ? undefined
            : buildInfiniteData([{ products, total: resolvedTotal, searchAfter: undefined }]),
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof useShopProducts>);
}

describe("ShopProductGrid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    it("renders skeleton loaders while loading", () => {
        setMock({ isPending: true });
        renderWithQueryClient(<ShopProductGrid shopName="Test Shop" shopType="AUCTION_HOUSE" />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders an error state when the hook returns an error", () => {
        setMock({ error: new Error("load failed") });
        renderWithQueryClient(<ShopProductGrid shopName="Test Shop" shopType="AUCTION_HOUSE" />);
        expect(screen.getByText("Artikel konnten nicht geladen werden")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Beim Laden der Artikel ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the no-results state when products list is empty", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<ShopProductGrid shopName="Test Shop" shopType="AUCTION_HOUSE" />);
        expect(screen.getByText("Keine Artikel gefunden")).toBeInTheDocument();
        expect(
            screen.getByText("Von diesem Shop sind derzeit keine Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("renders product cards for returned products", () => {
        setMock({
            products: [
                { ...baseProduct, productId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productId: "p2", title: "Roman Coin" },
            ],
            total: 2,
        });
        renderWithQueryClient(<ShopProductGrid shopName="Test Shop" shopType="AUCTION_HOUSE" />);
        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
    });

    it("renders the all-loaded message with the shop type name when all products are shown", () => {
        setMock({
            products: [
                { ...baseProduct, productId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productId: "p2", title: "Roman Coin" },
            ],
            total: 2,
            hasNextPage: false,
            isFetchingNextPage: false,
        });
        renderWithQueryClient(<ShopProductGrid shopName="Test Shop" shopType="AUCTION_HOUSE" />);
        expect(
            screen.getByText("Sie haben alle 2 Artikel von diesem Auktionshaus gesehen."),
        ).toBeInTheDocument();
    });

    it("renders the loading-more indicator when fetching next page", () => {
        setMock({
            products: [{ ...baseProduct, productId: "p1", title: "Ancient Vase" }],
            total: 5,
            hasNextPage: true,
            isFetchingNextPage: true,
        });
        renderWithQueryClient(<ShopProductGrid shopName="Test Shop" shopType="AUCTION_HOUSE" />);
        expect(screen.getByText("Weitere Artikel werden geladen...")).toBeInTheDocument();
    });

    it("calls useShopProducts with the provided shopName", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<ShopProductGrid shopName="Christie's" shopType="AUCTION_HOUSE" />);
        expect(mockUseShopProducts).toHaveBeenCalledWith("Christie's");
    });
});
