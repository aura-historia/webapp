import { makeProductListing, makePublicListingSource } from "@/test/fixtures.ts";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShopProductGrid } from "../ShopProductGrid.tsx";
import { useShopProducts } from "@/features/shop/profile/hooks/useShopProducts.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import type { ShopProductsPage } from "@/features/shop/profile/hooks/useShopProducts.ts";
import type { InfiniteData } from "@tanstack/react-query";

vi.mock("@/features/shop/profile/hooks/useShopProducts.ts", () => ({
    useShopProducts: vi.fn(),
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    Lottie: () => <div data-testid="lottie-animation" />,
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

vi.mock("@/features/watchlist/components/NotificationButton", () => ({
    NotificationButton: () => (
        <button type="button" data-testid="notification-button">
            Notification
        </button>
    ),
}));

const mockUseShopProducts = vi.mocked(useShopProducts);

const baseProduct = makeProductListing({ title: "Ancient Vase" });
const source = makePublicListingSource();

function buildInfiniteData(pages: ShopProductsPage[]): InfiniteData<ShopProductsPage> {
    return {
        pages,
        pageParams: pages.map((_, i) => (i === 0 ? undefined : `cursor-${i}`)),
    };
}

type MockOptions = {
    isPending?: boolean;
    error?: Error | null;
    products?: ProductListing[];
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
        renderWithQueryClient(<ShopProductGrid source={source} />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders an error state when the hook returns an error", () => {
        setMock({ error: new Error("load failed") });
        renderWithQueryClient(<ShopProductGrid source={source} />);
        expect(screen.getByText("Artikel konnten nicht geladen werden")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Beim Laden der Artikel ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the no-results state when products list is empty", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<ShopProductGrid source={source} />);
        expect(screen.getByText("Keine Artikel gefunden")).toBeInTheDocument();
        expect(
            screen.getByText("Derzeit sind keine Angebote bei Antique Store gelistet."),
        ).toBeInTheDocument();
    });

    it("renders product cards for returned products", () => {
        setMock({
            products: [
                { ...baseProduct, productListingId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productListingId: "p2", title: "Roman Coin" },
            ],
            total: 2,
        });
        renderWithQueryClient(<ShopProductGrid source={source} />);
        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
    });

    it("renders the loading-more indicator when fetching next page", () => {
        setMock({
            products: [{ ...baseProduct, productListingId: "p1", title: "Ancient Vase" }],
            total: 5,
            hasNextPage: true,
            isFetchingNextPage: true,
        });
        renderWithQueryClient(<ShopProductGrid source={source} />);
        expect(screen.getByText("Weitere Artikel werden geladen...")).toBeInTheDocument();
    });

    it("calls useShopProducts with the provided shopName", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<ShopProductGrid source={source} />);
        expect(mockUseShopProducts).toHaveBeenCalledWith("ls_01TESTSOURCE");
    });
});
