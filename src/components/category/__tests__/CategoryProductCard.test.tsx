import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { render, screen } from "@testing-library/react";
import { CategoryProductCard } from "../CategoryProductCard.tsx";
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

describe("CategoryProductCard", () => {
    const mockProduct: OverviewProduct = {
        productId: "1",
        productSlugId: "test-product-title",
        eventId: "",
        shopId: "shop-123",
        shopSlugId: "test-shop",
        shopsProductId: "item-456",
        shopName: "Test Shop",
        shopType: "AUCTION_HOUSE",
        title: "Test Product Title",
        description: "Test Description",
        price: "99,99 €",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        images: [
            {
                url: new URL("https://example.com/image.jpg"),
                prohibitedContentType: "NONE",
            },
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
    };

    it("should render the product title, shop name, and price correctly", () => {
        render(<CategoryProductCard product={mockProduct} />);

        expect(screen.getByText("Test Product Title")).toBeInTheDocument();
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
    });

    it("should render the product image when provided", () => {
        const { container } = render(<CategoryProductCard product={mockProduct} />);

        const image = container.querySelector("img[src='https://example.com/image.jpg']");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("alt", "Test Product Title");
    });

    it("should render a placeholder when no images are provided", () => {
        const productWithoutImages = { ...mockProduct, images: [] };
        render(<CategoryProductCard product={productWithoutImages} />);

        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
        expect(screen.getByText("Kein Bild verfügbar")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when price is not provided", () => {
        const productWithoutPrice = { ...mockProduct, price: undefined };
        render(<CategoryProductCard product={productWithoutPrice} />);

        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge", () => {
        render(<CategoryProductCard product={mockProduct} />);

        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the details button", () => {
        render(<CategoryProductCard product={mockProduct} />);

        expect(screen.getByText("Details")).toBeInTheDocument();
    });

    it("should truncate long titles with line-clamp", () => {
        const productWithLongTitle = {
            ...mockProduct,
            title: "This is a very long title that should be truncated to two lines maximum",
        };
        render(<CategoryProductCard product={productWithLongTitle} />);

        const titleElement = screen.getByText(productWithLongTitle.title);
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass("line-clamp-2");
    });
});
