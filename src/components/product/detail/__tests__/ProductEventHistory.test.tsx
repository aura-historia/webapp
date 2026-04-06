import type { ProductEvent } from "@/data/internal/product/ProductDetails.ts";
import { render, screen } from "@testing-library/react";
import { ProductEventHistory } from "@/components/product/detail/ProductEventHistory.tsx";
import { vi } from "vitest";

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

    describe("ORIGIN_YEAR_CHANGED events", () => {
        it("should render origin year changed event with exact year", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-5",
                eventType: "ORIGIN_YEAR_CHANGED",
                payload: { originYear: 1740 },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Entstehungsjahr aktualisiert/)).toBeInTheDocument();
            expect(screen.getByText(/1740/)).toBeInTheDocument();
        });
    });

    describe("AUTHENTICITY_CHANGED events", () => {
        it("should render authenticity changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-6",
                eventType: "AUTHENTICITY_CHANGED",
                payload: { authenticity: "ORIGINAL" },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Echtheit aktualisiert/)).toBeInTheDocument();
            expect(screen.getByText(/Original/)).toBeInTheDocument();
        });
    });

    describe("CONDITION_CHANGED events", () => {
        it("should render condition changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-7",
                eventType: "CONDITION_CHANGED",
                payload: { condition: "EXCELLENT" },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Zustand aktualisiert/)).toBeInTheDocument();
            expect(screen.getByText(/Exzellent/)).toBeInTheDocument();
        });
    });

    describe("PROVENANCE_CHANGED events", () => {
        it("should render provenance changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-8",
                eventType: "PROVENANCE_CHANGED",
                payload: { provenance: "COMPLETE" },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Provenienz aktualisiert/)).toBeInTheDocument();
            expect(screen.getByText(/Vollständig/)).toBeInTheDocument();
        });
    });

    describe("RESTORATION_CHANGED events", () => {
        it("should render restoration changed event", () => {
            const event: ProductEvent = {
                ...baseEvent,
                eventId: "evt-9",
                eventType: "RESTORATION_CHANGED",
                payload: { restoration: "MINOR" },
            };
            render(<ProductEventHistory event={event} />);
            expect(screen.getByTestId("timeline-item")).toBeInTheDocument();
            expect(screen.getByText(/Restaurierung aktualisiert/)).toBeInTheDocument();
            expect(screen.getByText(/Geringfügig/)).toBeInTheDocument();
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
