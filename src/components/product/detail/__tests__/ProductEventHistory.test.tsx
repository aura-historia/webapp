import type { ProductEvent } from "@/data/internal/product/ProductDetails.ts";
import { render, screen } from "@testing-library/react";
import { ProductEventHistory } from "@/components/product/detail/ProductEventHistory.tsx";
import { vi } from "vitest";

vi.mock("@tanstack/react-router", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
    return {
        ...actual,
        useRouteContext: () => ({ timeZone: "UTC" }),
    };
});

vi.mock("@/components/ui/timeline", () => ({
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

vi.mock("@/components/product/badges/StatusBadge", () => ({
    StatusBadge: ({ status }: { status: string }) => (
        <span data-testid="status-badge">{status}</span>
    ),
}));

vi.mock("@/components/product/badges/PriceBadge", () => ({
    PriceBadge: ({ eventType }: { eventType: string }) => (
        <span data-testid="price-badge">{eventType}</span>
    ),
}));

const baseEvent = {
    productId: "item-1",
    shopId: "shop-1",
    shopsProductId: "shops-item-1",
    timestamp: new Date("2024-01-15T10:00:00Z"),
};

describe("ProductEventHistory", () => {
    describe("ESTIMATE_PRICE_CHANGED events", () => {
        it("should render estimate price changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-1",
                eventType: "ESTIMATE_PRICE_CHANGED",
                payload: {
                    priceEstimateMin: { amount: 300000, currency: "EUR" },
                    priceEstimateMax: { amount: 600000, currency: "EUR" },
                },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Geschätzter Preisbereich aktualisiert/)).toBeInTheDocument();
        });

        it("should render estimate price changed event with only min", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-1",
                eventType: "ESTIMATE_PRICE_CHANGED",
                payload: {
                    priceEstimateMin: { amount: 300000, currency: "EUR" },
                },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByText(/Geschätzter Preisbereich aktualisiert/)).toBeInTheDocument();
        });
    });

    describe("URL_CHANGED events", () => {
        it("should render URL changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-2",
                eventType: "URL_CHANGED",
                payload: { url: "https://example.com/product" },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Produkt-URL aktualisiert/)).toBeInTheDocument();
        });
    });

    describe("IMAGES_CHANGED events", () => {
        it("should render images changed event with image count", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-3",
                eventType: "IMAGES_CHANGED",
                payload: { imageCount: 3 },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Bilder aktualisiert • 3 Bild\(er\)/)).toBeInTheDocument();
        });
    });

    describe("AUCTION_TIME_CHANGED events", () => {
        it("should render auction time changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-4",
                eventType: "AUCTION_TIME_CHANGED",
                payload: {
                    auctionStart: new Date("2026-04-10T10:00:00Z"),
                    auctionEnd: new Date("2026-04-10T12:00:00Z"),
                },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Auktionszeitraum aktualisiert/)).toBeInTheDocument();
        });
    });

    describe("unknown events", () => {
        it("should return null for unknown event types", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-unknown",
                eventType: "UNKNOWN_TYPE",
                payload: { state: "AVAILABLE" },
            };
            const { container } = render(<ProductEventHistory event={event} />);
            expect(container).toBeEmptyDOMElement();
        });
    });
});
