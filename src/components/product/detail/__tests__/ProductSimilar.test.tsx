import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductSimilar } from "../ProductSimilar.tsx";
import { vi } from "vitest";
import type React from "react";

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

vi.mock("@/hooks/useSimilarProducts.ts", () => ({
    useSimilarProducts: vi.fn(),
}));

import { useSimilarProducts } from "@/hooks/useSimilarProducts.ts";

beforeAll(() => {
    global.IntersectionObserver = class IntersectionObserver {
        disconnect() {}

        observe() {}

        takeRecords() {
            return [];
        }

        unobserve() {}
    } as unknown as typeof IntersectionObserver;

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
        }),
    });
});

describe("ProductSimilar", () => {
    const mockProducts: OverviewProduct[] = [
        {
            productId: "1",
            eventId: "",
            shopId: "shop1",
            shopsProductId: "item1",
            shopName: "Shop 1",
            shopType: "AUCTION_HOUSE",
            title: "Similar Product 1",
            description: "Description 1",
            price: "50€",
            state: "AVAILABLE",
            url: new URL("https://example.com/1"),
            images: [
                { url: new URL("https://example.com/image1.jpg"), prohibitedContentType: "NONE" },
            ],
            created: new Date(),
            updated: new Date(),
            originYear: undefined,
            originYearMin: undefined,
            originYearMax: undefined,
            authenticity: "UNKNOWN",
            condition: "UNKNOWN",
            provenance: "UNKNOWN",
            restoration: "UNKNOWN",
        },
        {
            productId: "2",
            eventId: "",
            shopId: "shop2",
            shopsProductId: "item2",
            shopName: "Shop 2",
            shopType: "AUCTION_HOUSE",
            title: "Similar Product 2",
            description: "Description 2",
            price: "75€",
            state: "AVAILABLE",
            url: new URL("https://example.com/2"),
            images: [
                { url: new URL("https://example.com/image2.jpg"), prohibitedContentType: "NONE" },
            ],
            created: new Date(),
            updated: new Date(),
            originYear: undefined,
            originYearMin: undefined,
            originYearMax: undefined,
            authenticity: "UNKNOWN",
            condition: "UNKNOWN",
            provenance: "UNKNOWN",
            restoration: "UNKNOWN",
        },
        {
            productId: "3",
            eventId: "",
            shopId: "shop3",
            shopsProductId: "item3",
            shopName: "Shop 3",
            shopType: "AUCTION_HOUSE",
            title: "Similar Product 3",
            description: "Description 3",
            price: undefined,
            state: "SOLD",
            url: new URL("https://example.com/3"),
            images: [],
            created: new Date(),
            updated: new Date(),
            originYear: undefined,
            originYearMin: undefined,
            originYearMax: undefined,
            authenticity: "UNKNOWN",
            condition: "UNKNOWN",
            provenance: "UNKNOWN",
            restoration: "UNKNOWN",
        },
    ];

    const defaultProps = {
        shopId: "test-shop",
        shopsProductId: "test-item",
    };

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

        render(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });

    it("should render error state correctly", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { message: "Failed to load similar products" },
        } as never);

        render(<ProductSimilar {...defaultProps} />);

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

        render(<ProductSimilar {...defaultProps} />);

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

        render(<ProductSimilar {...defaultProps} />);

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

        render(<ProductSimilar {...defaultProps} />);

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

        render(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Keine ähnlichen Artikel")).toBeInTheDocument();
    });

    it("should render similar products correctly in carousel", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        render(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("Ähnliche Artikel")).toBeInTheDocument();
        expect(screen.getByText("Similar Product 1")).toBeInTheDocument();
        expect(screen.getByText("Similar Product 2")).toBeInTheDocument();
        expect(screen.getByText("Similar Product 3")).toBeInTheDocument();
        expect(screen.getByText("Shop 1")).toBeInTheDocument();
        expect(screen.getByText("Shop 2")).toBeInTheDocument();
        expect(screen.getByText("Shop 3")).toBeInTheDocument();
    });

    it("should render navigation buttons for mobile view", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        render(<ProductSimilar {...defaultProps} />);

        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle carousel navigation", async () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        const user = userEvent.setup();
        render(<ProductSimilar {...defaultProps} />);

        const navigationButtons = screen.getAllByRole("button");

        await user.click(navigationButtons[0]);
        await waitFor(() => {
            expect(navigationButtons[0]).toBeInTheDocument();
        });
    });

    it("should render items with correct prices and without prices", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        render(<ProductSimilar {...defaultProps} />);

        expect(screen.getByText("50€")).toBeInTheDocument();
        expect(screen.getByText("75€")).toBeInTheDocument();
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render all product cards with detail buttons", () => {
        vi.mocked(useSimilarProducts).mockReturnValue({
            data: { isEmbeddingsPending: false, products: mockProducts },
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        render(<ProductSimilar {...defaultProps} />);

        const detailButtons = screen.getAllByText("Details");
        expect(detailButtons).toHaveLength(mockProducts.length);
    });
});
