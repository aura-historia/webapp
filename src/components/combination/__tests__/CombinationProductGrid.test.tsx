import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CombinationProductGrid } from "../CombinationProductGrid.tsx";
import { useCombinationProducts } from "@/hooks/combination/useCombinationProducts.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { CombinationProductsPage } from "@/hooks/combination/useCombinationProducts.ts";
import type { InfiniteData } from "@tanstack/react-query";

vi.mock("@/hooks/combination/useCombinationProducts.ts", () => ({
    useCombinationProducts: vi.fn(),
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

const mockUseCombinationProducts = vi.mocked(useCombinationProducts);

function buildInfiniteData(
    pages: CombinationProductsPage[],
): InfiniteData<CombinationProductsPage> {
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
    mockUseCombinationProducts.mockReturnValue({
        data: isPending
            ? undefined
            : buildInfiniteData([{ products, total: resolvedTotal, searchAfter: undefined }]),
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof useCombinationProducts>);
}

describe("CombinationProductGrid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    it("renders product grid items when data is loaded", () => {
        setMock({
            products: [
                { ...baseProduct, productId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productId: "p2", title: "Roman Coin" },
            ],
            total: 2,
        });

        renderWithQueryClient(
            <CombinationProductGrid categoryId="furniture" periodId="biedermeier" />,
        );

        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
    });

    it("renders skeletons when loading", () => {
        setMock({ isPending: true });

        renderWithQueryClient(
            <CombinationProductGrid categoryId="furniture" periodId="biedermeier" />,
        );

        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(8);
    });

    it("renders error state when there is an error", () => {
        setMock({ error: new Error("Failed to fetch") });

        renderWithQueryClient(
            <CombinationProductGrid categoryId="furniture" periodId="biedermeier" />,
        );

        expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
    });

    it("renders no results when products array is empty", () => {
        setMock({ products: [], total: 0 });

        renderWithQueryClient(
            <CombinationProductGrid categoryId="furniture" periodId="biedermeier" />,
        );

        expect(screen.getByText("Keine Objekte gefunden")).toBeInTheDocument();
    });

    it("calls useCombinationProducts with the provided categoryId and periodId", () => {
        setMock({ products: [], total: 0 });
        renderWithQueryClient(
            <CombinationProductGrid categoryId="furniture" periodId="biedermeier" />,
        );
        expect(mockUseCombinationProducts).toHaveBeenCalledWith("furniture", "biedermeier");
    });
});
