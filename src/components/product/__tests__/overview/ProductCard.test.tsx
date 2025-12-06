import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { screen } from "@testing-library/react";
import { ProductCard } from "../../overview/ProductCard.tsx";
import { vi } from "vitest";
import type React from "react";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

describe("ProductCard", () => {
    const mockItem: OverviewProduct = {
        created: new Date(),
        eventId: "",
        shopId: "",
        shopsProductId: "",
        updated: new Date(),
        url: new URL("https://example.com"),
        productId: "1",
        title: "Sample Item",
        shopName: "Sample Shop",
        state: "AVAILABLE",
        price: "100€",
        images: [new URL("https://example.com/image.jpg")],
    };

    it("should render the item title, shop name, and price correctly", () => {
        renderWithQueryClient(<ProductCard item={mockItem} />);
        expect(screen.getByText("Sample Item")).toBeInTheDocument();
        expect(screen.getByText("Sample Shop")).toBeInTheDocument();
        expect(screen.getByText("100€")).toBeInTheDocument();
    });

    it("should render a placeholder image when no images are provided", () => {
        const itemWithoutImages = { ...mockItem, images: [] };
        renderWithQueryClient(<ProductCard item={itemWithoutImages} key="2" />);
        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when the price is not provided", () => {
        const itemWithoutPrice = { ...mockItem, price: undefined };
        renderWithQueryClient(<ProductCard item={itemWithoutPrice} />);
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", () => {
        renderWithQueryClient(<ProductCard item={mockItem} />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the buttons for details and external link", () => {
        renderWithQueryClient(<ProductCard item={mockItem} />);
        expect(screen.getByText("Details")).toBeInTheDocument();
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });
});
