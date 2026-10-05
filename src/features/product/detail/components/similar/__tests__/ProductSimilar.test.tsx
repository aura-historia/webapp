import { makeProductListing, makeProductListingUserState } from "@/test/fixtures.ts";
import { renderWithQueryClient } from "@/test/utils.tsx";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { screen } from "@testing-library/react";
import { ProductSimilar } from "../ProductSimilar.tsx";
import { vi } from "vitest";
import type React from "react";

// Mock the entire embla carousel to avoid plugin comparison errors in jsdom
vi.mock("embla-carousel-react", () => ({
    default: () => [
        vi.fn(),
        {
            on: vi.fn(),
            off: vi.fn(),
            scrollPrev: vi.fn(),
            scrollNext: vi.fn(),
            canScrollNext: vi.fn(() => false),
            canScrollPrev: vi.fn(() => false),
        },
    ],
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

vi.mock("@/features/notification-center/api/useMarkNotificationsSeen.ts", () => ({
    useMarkNotificationsSeen: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/features/product/detail/api/useSimilarProducts.ts", () => ({
    useSimilarProducts: vi.fn(),
}));

import { useSimilarProducts } from "@/features/product/detail/api/useSimilarProducts.ts";

describe("ProductSimilar", () => {
    const mockProducts: ProductListing[] = [
        makeProductListing({
            productListingId: "1",
            title: "Similar Product 1",
            formattedPrice: "50€",
            source: { listingSourceId: "s1", slugId: "shop-1", name: "Shop 1" },
        }),
        makeProductListing({
            productListingId: "2",
            title: "Similar Product 2",
            formattedPrice: "75€",
            source: { listingSourceId: "s2", slugId: "shop-2", name: "Shop 2" },
        }),
        makeProductListing({
            productListingId: "3",
            title: "Similar Product 3",
            price: undefined,
            formattedPrice: undefined,
            source: { listingSourceId: "s3", slugId: "shop-3", name: "Shop 3" },
        }),
    ];
    const defaultProps = { productListingId: "test-listing" };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render loading state correctly", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        const skeleton = document.querySelector(".animate-pulse");
        expect(skeleton).toBeInTheDocument();
    });

    it("should render error state correctly", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { message: "Failed to load similar products" },
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
        expect(screen.getByText("Failed to load similar products")).toBeInTheDocument();
    });

    it("should render error state with fallback message when error has no message", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: {},
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
        expect(
            screen.getByText("Ähnliche Artikel konnten nicht geladen werden."),
        ).toBeInTheDocument();
    });

    it("should render embeddings pending state correctly", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: true, products: [] },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        expect(screen.getByText("Wird vorbereitet")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Ähnliche Artikel werden vorbereitet. Dies kann bei neuen Artikeln bis zu 24 Stunden dauern.",
            ),
        ).toBeInTheDocument();
    });

    it("should render no data state when products array is empty", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: [] },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        expect(screen.getByText("Keine ähnlichen Artikel")).toBeInTheDocument();
        expect(
            screen.getByText("Für diesen Artikel wurden keine ähnlichen Produkte gefunden."),
        ).toBeInTheDocument();
    });

    it("should render no data state when products is undefined", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: undefined as never },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Keine ähnlichen Artikel")).toBeInTheDocument();
    });

    it("should render HiddenMatchCard instead of ProductGridItem when product is hidden", () => {
        const hiddenProduct = makeProductListing({
            userState: makeProductListingUserState({
                searchFilter: { matched: true, hidden: true },
            }),
        });
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: [hiddenProduct] },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText(/Verborgen/i)).toBeInTheDocument();
        expect(screen.queryByText(mockProducts[0].title ?? "")).not.toBeInTheDocument();
    });

    it("should render similar products correctly in grid", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        expect(screen.getByText("Similar Product 1")).toBeInTheDocument();
        expect(screen.getByText("Similar Product 2")).toBeInTheDocument();
        expect(screen.getByText("Similar Product 3")).toBeInTheDocument();
        expect(screen.getByText("Shop 1")).toBeInTheDocument();
        expect(screen.getByText("Shop 2")).toBeInTheDocument();
        expect(screen.getByText("Shop 3")).toBeInTheDocument();
    });

    it("should render product cards in a carousel", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        const { container } = renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(container.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
    });

    it("should render items with correct prices and without prices", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("50€")).toBeInTheDocument();
        expect(screen.getByText("75€")).toBeInTheDocument();
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render all product cards with product links", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        const { container } = renderWithQueryClient(<ProductSimilar {...defaultProps} />);

        const productLinks = container.querySelectorAll("a[to]");
        expect(productLinks.length).toBeGreaterThanOrEqual(mockProducts.length);
    });
});
