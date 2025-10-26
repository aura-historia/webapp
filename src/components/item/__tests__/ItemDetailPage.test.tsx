import type { ItemDetail } from "@/data/internal/ItemDetails";
import { render, screen } from "@testing-library/react";
import { ItemDetailPage } from "../ItemDetailPage";
import { vi } from "vitest";

vi.mock("@/components/item/ItemInfo", () => ({
    ItemInfo: ({ item }: { item: ItemDetail }) => (
        <div data-testid="item-info">ItemInfo: {item.title}</div>
    ),
}));

vi.mock("@/components/item/ItemPriceChart", () => ({
    ItemPriceChart: () => <div data-testid="item-price-chart">ItemPriceChart</div>,
}));

vi.mock("@/components/item/ItemHistory", () => ({
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
        render(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-info")).toBeInTheDocument();
        expect(screen.getByText("ItemInfo: Test Item")).toBeInTheDocument();
    });

    it("should render ItemPriceChart component", () => {
        render(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-price-chart")).toBeInTheDocument();
    });

    it("should render ItemHistory component", () => {
        render(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-history")).toBeInTheDocument();
    });

    it("should render all three components together", () => {
        render(<ItemDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-info")).toBeInTheDocument();
        expect(screen.getByTestId("item-price-chart")).toBeInTheDocument();
        expect(screen.getByTestId("item-history")).toBeInTheDocument();
    });
});
