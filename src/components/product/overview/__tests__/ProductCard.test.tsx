import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { act, screen } from "@testing-library/react";
import { ProductCard } from "../ProductCard.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

describe("ProductCard", () => {
    const mockProduct: OverviewProduct = {
        created: new Date(),
        eventId: "",
        shopId: "",
        shopsProductId: "",
        updated: new Date(),
        url: new URL("https://example.com"),
        productId: "1",
        title: "Sample Product",
        shopName: "Sample Shop",
        shopType: "AUCTION_HOUSE",
        state: "AVAILABLE",
        price: "100€",
        images: [{ url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" }],
        originYear: undefined,
        originYearMin: undefined,
        originYearMax: undefined,
        authenticity: "UNKNOWN",
        condition: "UNKNOWN",
        provenance: "UNKNOWN",
        restoration: "UNKNOWN",
    };

    it("should render the product title, shop name, and price correctly", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Sample Product")).toBeInTheDocument();
        expect(screen.getByText("Sample Shop")).toBeInTheDocument();
        expect(screen.getByText("100€")).toBeInTheDocument();
    });

    it("should render a placeholder image when no images are provided", async () => {
        const productWithoutImages = { ...mockProduct, images: [] };
        await act(() => {
            renderWithRouter(<ProductCard product={productWithoutImages} key="2" />);
        });
        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when the price is not provided", async () => {
        const productWithoutPrice = { ...mockProduct, price: undefined };
        await act(() => {
            renderWithRouter(<ProductCard product={productWithoutPrice} />);
        });
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the buttons for details and external link", async () => {
        await act(() => {
            renderWithRouter(<ProductCard product={mockProduct} />);
        });
        expect(screen.getByText("Details")).toBeInTheDocument();
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });
});
