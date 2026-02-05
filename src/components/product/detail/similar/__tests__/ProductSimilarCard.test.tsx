import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { render, screen } from "@testing-library/react";
import { ProductSimilarCard } from "../ProductSimilarCard.tsx";
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

describe("ProductSimilarCard", () => {
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
        render(<ProductSimilarCard product={mockProduct} />);

        expect(screen.getByText("Test Product Title")).toBeInTheDocument();
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
    });

    it("should render the product image when provided", () => {
        const { container } = render(<ProductSimilarCard product={mockProduct} />);

        const image = container.querySelector("img[src='https://example.com/image.jpg']");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("alt", "");
    });

    it("should render a placeholder when no images are provided", () => {
        const productWithoutImages = { ...mockProduct, images: [] };
        render(<ProductSimilarCard product={productWithoutImages} />);

        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
        expect(screen.getByText("Kein Bild verfügbar")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when price is not provided", () => {
        const productWithoutPrice = { ...mockProduct, price: undefined };
        render(<ProductSimilarCard product={productWithoutPrice} />);

        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with 'Verfügbar' for AVAILABLE state", () => {
        render(<ProductSimilarCard product={mockProduct} />);

        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the status badge with 'Verkauft' for SOLD state", () => {
        const soldProduct = { ...mockProduct, state: "SOLD" as const };
        render(<ProductSimilarCard product={soldProduct} />);

        expect(screen.getByText("Verkauft")).toBeInTheDocument();
    });

    it("should render the status badge with 'Reserviert' for RESERVED state", () => {
        const reservedProduct = { ...mockProduct, state: "RESERVED" as const };
        render(<ProductSimilarCard product={reservedProduct} />);

        expect(screen.getByText("Reserviert")).toBeInTheDocument();
    });

    it("should render the details button", () => {
        render(<ProductSimilarCard product={mockProduct} />);

        expect(screen.getByText("Details")).toBeInTheDocument();
    });

    it("should have correct links to product detail page", () => {
        const { container } = render(<ProductSimilarCard product={mockProduct} />);

        const links = container.querySelectorAll("a");
        expect(links.length).toBeGreaterThan(0);

        links.forEach((link) => {
            expect(link).toHaveAttribute("to");
        });
    });

    it("should truncate long titles correctly with line-clamp", () => {
        const productWithLongTitle = {
            ...mockProduct,
            title: "This is a very long title that should be truncated to two lines maximum to prevent overflow and maintain layout consistency",
        };
        render(<ProductSimilarCard product={productWithLongTitle} />);

        const titleElement = screen.getByText(productWithLongTitle.title);
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass("line-clamp-2");
    });

    it("should truncate long shop names correctly with line-clamp", () => {
        const productWithLongShopName = {
            ...mockProduct,
            shopName: "This is a very long shop name that should be truncated to one line",
        };
        render(<ProductSimilarCard product={productWithLongShopName} />);

        const shopNameElement = screen.getByText(productWithLongShopName.shopName);
        expect(shopNameElement).toBeInTheDocument();
        expect(shopNameElement).toHaveClass("line-clamp-1");
    });

    it("should render multiple images by showing only the first one", () => {
        const productWithMultipleImages = {
            ...mockProduct,
            images: [
                {
                    url: new URL("https://example.com/image1.jpg"),
                    prohibitedContentType: "NONE" as const,
                },
                {
                    url: new URL("https://example.com/image2.jpg"),
                    prohibitedContentType: "NONE" as const,
                },
                {
                    url: new URL("https://example.com/image3.jpg"),
                    prohibitedContentType: "NONE" as const,
                },
            ],
        };
        const { container } = render(<ProductSimilarCard product={productWithMultipleImages} />);

        const image = container.querySelector("img[src='https://example.com/image1.jpg']");
        expect(image).toBeInTheDocument();
    });

    it("should apply hover effects to image and title", () => {
        const { container } = render(<ProductSimilarCard product={mockProduct} />);

        const image = container.querySelector("img");
        expect(image).toHaveClass("hover:opacity-90");

        const titleElement = screen.getByText("Test Product Title");
        expect(titleElement).toHaveClass("hover:underline");
    });

    it("should render with proper responsive layout classes", () => {
        const { container } = render(<ProductSimilarCard product={mockProduct} />);

        const card = container.querySelector(".flex-col");
        expect(card).toBeInTheDocument();
    });

    it("should handle empty price string", () => {
        const productWithEmptyPrice = { ...mockProduct, price: "" };
        render(<ProductSimilarCard product={productWithEmptyPrice} />);

        const priceElement = screen.queryByText("99,99 €");
        expect(priceElement).not.toBeInTheDocument();
    });

    it("should render Eye icon in details button", () => {
        const { container } = render(<ProductSimilarCard product={mockProduct} />);

        const detailsLink = screen.getByText("Details").closest("a");
        expect(detailsLink).toBeInTheDocument();

        const eyeIcon = container.querySelector(".lucide-eye");
        expect(eyeIcon).toBeInTheDocument();
    });
});
