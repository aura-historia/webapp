import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { screen } from "@testing-library/react";
import { ItemDetailPage } from "../../detail/ItemDetailPage.tsx";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/components/item/detail/ItemInfo.tsx", () => ({
    ItemInfo: ({ item }: { item: ItemDetail }) => (
        <div data-testid="item-info">ItemInfo: {item.title}</div>
    ),
}));

vi.mock("@/components/item/detail/ItemPriceChart.tsx", () => ({
    ItemPriceChart: () => <div data-testid="item-price-chart">ItemPriceChart</div>,
}));

vi.mock("@/components/item/detail/ItemHistory.tsx", () => ({
    ItemHistory: () => <div data-testid="item-history">ItemHistory</div>,
}));

describe("ItemDetailPage", () => {
    const mockItem: ItemDetail = {
        itemId: "1",
        eventId: "",
        shopId: "",
        shopsItemId: "",
        shopName: "Test Shop",
        title: "Test Item",
        description: "Test description",
        price: "99€",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        images: [new URL("https://example.com/image.jpg")],
        created: new Date(),
        updated: new Date(),
        history: [],
    };

    it("should render ItemInfo component", () => {
        renderWithQueryClient(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-info")).toBeInTheDocument();
        expect(screen.getByText("ItemInfo: Test Item")).toBeInTheDocument();
    });

    it("should render ItemPriceChart component", () => {
        renderWithQueryClient(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-price-chart")).toBeInTheDocument();
    });

    it("should render ItemHistory component", () => {
        renderWithQueryClient(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-history")).toBeInTheDocument();
    });

    it("should render all three components together", () => {
        renderWithQueryClient(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-info")).toBeInTheDocument();
        expect(screen.getByTestId("item-price-chart")).toBeInTheDocument();
        expect(screen.getByTestId("item-history")).toBeInTheDocument();
    });
});
