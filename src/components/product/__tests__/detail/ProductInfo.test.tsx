import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { screen } from "@testing-library/react";
import { ProductInfo } from "../../detail/ProductInfo.tsx";
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
    const mockItem: ProductDetail = {
        productId: "1",
        eventId: "",
        shopId: "",
        shopsProductId: "",
        shopName: "Test Shop",
        title: "Test Item Title",
        description: "This is a test description",
        price: "99,99 €",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        images: [new URL("https://example.com/image.jpg")],
        created: new Date(),
        updated: new Date(),
    };

    it("should render the item title, shop name, and price correctly", () => {
        renderWithQueryClient(<ProductInfo item={mockItem} />);
        expect(screen.getByText("Test Item Title")).toBeInTheDocument();
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
    });

    it("should render the description correctly", () => {
        renderWithQueryClient(<ProductInfo item={mockItem} />);
        expect(screen.getByText("This is a test description")).toBeInTheDocument();
    });

    it("should render 'Keine Beschreibung verfügbar' when description is not provided", () => {
        const itemWithoutDescription = { ...mockItem, description: undefined };
        renderWithQueryClient(<ProductInfo item={itemWithoutDescription} />);
        expect(screen.getByText("Keine Beschreibung verfügbar")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when price is not provided", () => {
        const itemWithoutPrice = { ...mockItem, price: undefined };
        renderWithQueryClient(<ProductInfo item={itemWithoutPrice} />);
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", () => {
        renderWithQueryClient(<ProductInfo item={mockItem} />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the button to the shop", () => {
        renderWithQueryClient(<ProductInfo item={mockItem} />);
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });

    it("should render floating action buttons (Share and Heart)", () => {
        renderWithQueryClient(<ProductInfo item={mockItem} />);
        const shareButtons = screen.getAllByRole("button");
        expect(shareButtons.length).toBeGreaterThan(0);
    });
});
