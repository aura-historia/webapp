vi.mock("lottie-react", () => ({
    default: () => null,
}));

import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { screen } from "@testing-library/react";
import { ProductInfo } from "../ProductInfo.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

beforeAll(() => {
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

describe("ProductInfo", () => {
    const mockProduct: ProductDetail = {
        productId: "1",
        eventId: "",
        shopId: "",
        shopsProductId: "",
        shopName: "Test Shop",
        shopType: "AUCTION_HOUSE",
        title: "Test Product Title",
        description: "This is a test description",
        price: "99,99 €",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        images: [{ url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" }],
        created: new Date(),
        updated: new Date(),
        originYear: undefined,
        originYearMin: undefined,
        originYearMax: undefined,
        authenticity: "UNKNOWN",
        condition: "UNKNOWN",
        provenance: "UNKNOWN",
        restoration: "UNKNOWN",
    };

    it("should render the product title, shop name, and price correctly", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Test Product Title")).toBeInTheDocument();
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
    });

    it("should render the description correctly", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("This is a test description")).toBeInTheDocument();
    });

    it("should render 'Keine Beschreibung verfügbar' when description is not provided", () => {
        const productWithoutDescription = { ...mockProduct, description: undefined };
        renderWithQueryClient(<ProductInfo product={productWithoutDescription} />);
        expect(screen.getByText("Keine Beschreibung verfügbar")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when price is not provided", () => {
        const productWithoutPrice = { ...mockProduct, price: undefined };
        renderWithQueryClient(<ProductInfo product={productWithoutPrice} />);
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the button to the shop", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });

    it("should render floating action buttons (Share and Heart)", () => {
        renderWithQueryClient(<ProductInfo product={mockProduct} />);
        const shareButtons = screen.getAllByRole("button");
        expect(shareButtons.length).toBeGreaterThan(0);
    });
});
