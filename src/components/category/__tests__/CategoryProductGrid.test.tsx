import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryProductGrid } from "../CategoryProductGrid.tsx";
import { useCategoryProducts } from "@/hooks/category/useCategoryProducts.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { CategoryProductsPage } from "@/hooks/category/useCategoryProducts.ts";
import type { InfiniteData } from "@tanstack/react-query";

vi.mock("@/hooks/category/useCategoryProducts.ts", () => ({
    useCategoryProducts: vi.fn(),
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

const mockUseCategoryProducts = vi.mocked(useCategoryProducts);

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

function buildInfiniteData(pages: CategoryProductsPage[]): InfiniteData<CategoryProductsPage> {
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
    mockUseCategoryProducts.mockReturnValue({
        data: isPending
            ? undefined
            : buildInfiniteData([{ products, total: resolvedTotal, searchAfter: undefined }]),
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof useCategoryProducts>);
}

describe("CategoryProductGrid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    it("renders skeleton loaders while loading", () => {
        setMock({ isPending: true });
        renderWithQueryClient(<CategoryProductGrid categoryId="furniture-1" />);
        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders an error state when the hook returns an error", () => {
        setMock({ error: new Error("load failed") });
        renderWithQueryClient(<CategoryProductGrid categoryId="furniture-1" />);
        expect(screen.getByText("Artikel konnten nicht geladen werden")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Beim Laden der Artikel ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the no-results state when products list is empty", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<CategoryProductGrid categoryId="furniture-1" />);
        expect(screen.getByText("Keine Artikel gefunden")).toBeInTheDocument();
        expect(
            screen.getByText("In dieser Kategorie sind derzeit keine Artikel vorhanden."),
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
        renderWithQueryClient(<CategoryProductGrid categoryId="furniture-1" />);
        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
    });

    it("renders the all-loaded message when all products are shown", () => {
        setMock({
            products: [
                { ...baseProduct, productId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productId: "p2", title: "Roman Coin" },
            ],
            total: 2,
            hasNextPage: false,
            isFetchingNextPage: false,
        });
        renderWithQueryClient(<CategoryProductGrid categoryId="furniture-1" />);
        expect(
            screen.getByText("Sie haben alle 2 Artikel dieser Kategorie gesehen."),
        ).toBeInTheDocument();
    });

    it("renders the loading-more indicator when fetching next page", () => {
        setMock({
            products: [{ ...baseProduct, productId: "p1", title: "Ancient Vase" }],
            total: 5,
            hasNextPage: true,
            isFetchingNextPage: true,
        });
        renderWithQueryClient(<CategoryProductGrid categoryId="furniture-1" />);
        expect(screen.getByText("Weitere Artikel werden geladen...")).toBeInTheDocument();
    });

    it("calls useCategoryProducts with the provided categoryId", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(<CategoryProductGrid categoryId="ancient-pottery" />);
        expect(mockUseCategoryProducts).toHaveBeenCalledWith("ancient-pottery");
    });
});
