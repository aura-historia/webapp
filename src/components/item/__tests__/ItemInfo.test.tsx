import type { ItemDetail } from "@/data/internal/ItemDetails";
import { render, screen } from "@testing-library/react";
import { ItemInfo } from "../ItemInfo";

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

describe("ItemInfo", () => {
    const mockItem: ItemDetail = {
        itemId: "1",
        eventId: "",
        shopId: "",
        shopsItemId: "",
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
        render(<ItemInfo item={mockItem} />);
        expect(screen.getByText("Test Item Title")).toBeInTheDocument();
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("99,99 €")).toBeInTheDocument();
    });

    it("should render the description correctly", () => {
        render(<ItemInfo item={mockItem} />);
        expect(screen.getByText("This is a test description")).toBeInTheDocument();
    });

    it("should render 'Keine Beschreibung verfügbar' when description is not provided", () => {
        const itemWithoutDescription = { ...mockItem, description: undefined };
        render(<ItemInfo item={itemWithoutDescription} />);
        expect(screen.getByText("Keine Beschreibung verfügbar")).toBeInTheDocument();
    });

    it("should render 'Preis unbekannt' when price is not provided", () => {
        const itemWithoutPrice = { ...mockItem, price: undefined };
        render(<ItemInfo item={itemWithoutPrice} />);
        expect(screen.getByText("Preis unbekannt")).toBeInTheDocument();
    });

    it("should render the status badge with the correct status", () => {
        render(<ItemInfo item={mockItem} />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
    });

    it("should render the button to the shop", () => {
        render(<ItemInfo item={mockItem} />);
        expect(screen.getByText("Zur Seite des Händlers")).toBeInTheDocument();
    });

    it("should render floating action buttons (Share and Heart)", () => {
        render(<ItemInfo item={mockItem} />);
        const shareButtons = screen.getAllByRole("button");
        expect(shareButtons.length).toBeGreaterThan(0);
    });
});
