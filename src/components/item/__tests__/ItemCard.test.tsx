import type { OverviewItem } from "@/data/internal/OverviewItem";
import { screen } from "@testing-library/react";
import { ItemCard } from "../ItemCard";
import { vi } from "vitest";
import type React from "react";
import { renderWithTranslations } from "@/test/utils.tsx";

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
}));

describe("ItemCard", () => {
    const mockItem: OverviewItem = {
        created: new Date(),
        eventId: "",
        shopId: "",
        shopsItemId: "",
        updated: new Date(),
        url: new URL("https://example.com"),
        itemId: "1",
        title: "Sample Item",
        shopName: "Sample Shop",
        state: "AVAILABLE",
        price: "100€",
        images: [new URL("https://example.com/image.jpg")],
    };

    it("should render the item title, shop name, and price correctly", () => {
        renderWithTranslations(<ItemCard item={mockItem} />);
        expect(screen.getByText("Sample Item")).toBeInTheDocument();
        expect(screen.getByText("Sample Shop")).toBeInTheDocument();
        expect(screen.getByText("100€")).toBeInTheDocument();
    });

    it("should render a placeholder image when no images are provided", () => {
        const itemWithoutImages = { ...mockItem, images: [] };
        renderWithTranslations(<ItemCard item={itemWithoutImages} key="2" />);
        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when the price is not provided", () => {
        const itemWithoutPrice = { ...mockItem, price: undefined };
        renderWithTranslations(<ItemCard item={itemWithoutPrice} />);
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", () => {
        renderWithTranslations(<ItemCard item={mockItem} />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the buttons for details and external link", () => {
        renderWithTranslations(<ItemCard item={mockItem} />);
        expect(screen.getByText("Details")).toBeInTheDocument();
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });
});
