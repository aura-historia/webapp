import type { ProductEvent } from "@/data/internal/ProductDetails.ts";
import { render, screen } from "@testing-library/react";
import { ProductHistory } from "@/components/product/detail/ProductHistory.tsx";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/ui/timeline", () => ({
    Timeline: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline">{children}</div>
    ),
    TimelineItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-item">{children}</div>
    ),
    TimelineTitle: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-title">{children}</div>
    ),
    TimelineDescription: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-description">{children}</div>
    ),
    TimelineTime: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-time">{children}</div>
    ),
    TimelineHeader: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-header">{children}</div>
    ),
}));

vi.mock("@/components/product/StatusBadge", () => ({
    StatusBadge: ({ status }: { status: string }) => (
        <span data-testid="status-badge">{status}</span>
    ),
}));

vi.mock("@/components/product/PriceBadge", () => ({
    PriceBadge: ({ eventType }: { eventType: string }) => (
        <span data-testid="price-badge">{eventType}</span>
    ),
}));

describe("ProductHistory", () => {
    const mockStateEvent: ProductEvent = {
        eventId: "1",
        productId: "item-1",
        shopId: "shop-1",
        shopsProductId: "shops-item-1",
        eventType: "STATE_AVAILABLE",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        payload: {
            oldState: "LISTED",
            newState: "AVAILABLE",
        },
    };

    const mockPriceEvent: ProductEvent = {
        eventId: "2",
        productId: "item-1",
        shopId: "shop-1",
        shopsProductId: "shops-item-1",
        eventType: "PRICE_INCREASED",
        timestamp: new Date("2024-01-16T11:00:00Z"),
        payload: {
            oldPrice: { amount: 8999, currency: "EUR" },
            newPrice: { amount: 9999, currency: "EUR" },
        },
    };

    const mockCreatedEvent: ProductEvent = {
        eventId: "3",
        productId: "item-1",
        shopId: "shop-1",
        shopsProductId: "shops-item-1",
        eventType: "CREATED",
        timestamp: new Date("2024-01-14T09:00:00Z"),
        payload: {
            state: "AVAILABLE",
            price: { amount: 8999, currency: "EUR" },
        },
    };

    it("should render empty state when history is undefined", () => {
        render(<ProductHistory history={undefined} />);
        expect(screen.getByText("Historie")).toBeInTheDocument();
        expect(screen.getByText("Keine Daten für diesen Artikel vorhanden.")).toBeInTheDocument();
    });

    it("should render empty state when history is empty array", () => {
        render(<ProductHistory history={[]} />);
        expect(screen.getByText("Keine Daten für diesen Artikel vorhanden.")).toBeInTheDocument();
    });

    it("should render all filter buttons", () => {
        render(<ProductHistory history={[mockStateEvent]} />);
        expect(screen.getByText("Alle")).toBeInTheDocument();
        expect(screen.getByText("Preis")).toBeInTheDocument();
        expect(screen.getByText("Verfügbarkeit")).toBeInTheDocument();
    });

    it("should render state events correctly", () => {
        render(<ProductHistory history={[mockStateEvent]} />);
        expect(screen.getByTestId("timeline")).toBeInTheDocument();
        expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
        expect(screen.getByTestId("status-badge")).toHaveTextContent("AVAILABLE");
    });

    it("should render price events correctly", () => {
        render(<ProductHistory history={[mockPriceEvent]} />);
        expect(screen.getByTestId("price-badge")).toHaveTextContent("PRICE_INCREASED");
    });

    it("should render created events correctly", () => {
        render(<ProductHistory history={[mockCreatedEvent]} />);
        expect(screen.getByTestId("status-badge")).toHaveTextContent("AVAILABLE");
        expect(screen.getByText(/Im System erfasst/)).toBeInTheDocument();
    });

    it("should filter to show only state events when Verfügbarkeit is clicked", async () => {
        const user = userEvent.setup();
        render(<ProductHistory history={[mockStateEvent, mockPriceEvent]} />);

        const availabilityButton = screen.getByText("Verfügbarkeit");
        await user.click(availabilityButton);

        const timelineItems = screen.getAllByTestId("timeline-item");
        expect(timelineItems).toHaveLength(1);
        expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    });

    it("should filter to show only price events when Preis is clicked", async () => {
        const user = userEvent.setup();
        render(<ProductHistory history={[mockStateEvent, mockPriceEvent]} />);

        const preisButton = screen.getByText("Preis");
        await user.click(preisButton);

        const timelineItems = screen.getAllByTestId("timeline-item");
        expect(timelineItems).toHaveLength(1);
        expect(screen.getByTestId("price-badge")).toBeInTheDocument();
    });

    it("should show all events when Alle filter is active", async () => {
        const user = userEvent.setup();
        render(<ProductHistory history={[mockStateEvent, mockPriceEvent, mockCreatedEvent]} />);

        await user.click(screen.getByText("Preis"));
        await user.click(screen.getByText("Alle"));

        const timelineItems = screen.getAllByTestId("timeline-item");
        expect(timelineItems).toHaveLength(3);
    });

    it("should show empty filter message when no events match filter", async () => {
        const user = userEvent.setup();
        render(<ProductHistory history={[mockStateEvent]} />);

        const preisButton = screen.getByText("Preis");
        await user.click(preisButton);

        expect(screen.getByText("Keine Events für diesen Filter verfügbar.")).toBeInTheDocument();
    });
});
