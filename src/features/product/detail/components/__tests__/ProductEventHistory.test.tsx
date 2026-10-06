import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { render, screen, within } from "@testing-library/react";
import { ProductEventHistory } from "@/features/product/detail/components/ProductEventHistory.tsx";
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

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, string | number>) =>
            [key, ...Object.values(values ?? {})].join(" "),
        i18n: { language: "en" },
    }),
}));

const changedEvent: ProductListingHistoryEntry = {
    eventType: "PRODUCT_LISTING_CHANGED",
    productListingId: "plist_123",
    eventId: "event-1",
    timestamp: new Date("2026-09-02T10:00:00Z"),
    payload: {
        kind: "CHANGED",
        changes: [
            {
                type: "MAIN_PRICE_CHANGED",
                previous: { type: "MONETARY", amount: 10000, currency: "EUR" },
                current: { type: "ON_REQUEST" },
            },
            {
                type: "MINIMUM_ESTIMATE_CHANGED",
                previous: null,
                current: { amount: 9000, currency: "EUR" },
            },
            {
                type: "MAXIMUM_ESTIMATE_CHANGED",
                previous: { amount: 20000, currency: "EUR" },
                current: null,
            },
            { type: "AVAILABILITY_CHANGED", previous: "AVAILABLE", current: "RESERVED" },
            {
                type: "URL_CHANGED",
                previous: "https://example.com/old",
                current: "https://example.com/new",
            },
            { type: "IMAGES_CHANGED", previousCount: 2, currentCount: 4 },
            {
                type: "AUCTION_CHANGED",
                previous: null,
                current: {
                    lotNumber: "A-12",
                    cataloguePosition: 5,
                    biddingOpens: null,
                    scheduledCloses: null,
                    reportedClosedAt: null,
                },
            },
            { type: "WITHDRAWN", previousAvailability: "RESERVED" },
            { type: "RESTORED" },
            {
                type: "SALE_OBSERVED",
                observation: {
                    observedAt: new Date("2026-09-01T08:00:00Z"),
                    fxRateId: "fxrate_1",
                },
            },
            {
                type: "SALE_OBSERVATION_RETRACTED",
                observation: {
                    observedAt: new Date("2026-09-01T08:00:00Z"),
                    fxRateId: "fxrate_1",
                },
            },
        ],
    },
};

describe("ProductEventHistory", () => {
    it("renders every change from a grouped history event in one timeline item", () => {
        render(<ProductEventHistory event={changedEvent} />);

        expect(screen.getAllByTestId("timeline-item")).toHaveLength(1);
        expect(screen.getByText("product.history.events.listingChangedTitle")).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.mainPriceChanged/)).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.minimumEstimateChanged/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.maximumEstimateChanged/),
        ).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.availabilityChanged/)).toBeInTheDocument();
        expect(screen.getByText("product.history.events.urlChanged")).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.imagesChangedWithCounts/),
        ).toBeInTheDocument();
        expect(screen.getByText("product.history.events.auctionChanged")).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.withdrawn/)).toBeInTheDocument();
        expect(screen.getByText("product.history.events.restored")).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.saleObserved/)).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.saleObservationRetracted/),
        ).toBeInTheDocument();
        expect(screen.getAllByTestId("timeline-description")).toHaveLength(11);
    });

    it("keeps price filtering on the relevant changes without splitting the event", () => {
        render(<ProductEventHistory event={changedEvent} filter="price" />);

        const item = screen.getByTestId("timeline-item");
        expect(within(item).getAllByTestId("timeline-description")).toHaveLength(3);
        expect(within(item).getByText(/product.history.values.onRequest/)).toBeInTheDocument();
        expect(within(item).queryByText("product.history.events.restored")).not.toBeInTheDocument();
    });

    it("renders a discovery snapshot with an on-request price", () => {
        const discovery: ProductListingHistoryEntry = {
            eventType: "PRODUCT_LISTING_DISCOVERED",
            productListingId: "plist_123",
            eventId: "event-discovered",
            timestamp: new Date("2026-09-01T10:00:00Z"),
            payload: {
                kind: "DISCOVERED",
                discovery: {
                    listingSourceId: "lsource_123",
                    sourceListingId: "source-item-1",
                    pricing: { price: { type: "ON_REQUEST" } },
                    availability: "AVAILABLE",
                    url: "https://example.com/item",
                    imageCount: 2,
                    auction: null,
                },
            },
        };

        render(<ProductEventHistory event={discovery} />);

        expect(
            screen.getByText("product.history.events.listingDiscoveredTitle"),
        ).toBeInTheDocument();
        expect(screen.getByText(/product.history.values.onRequest/)).toBeInTheDocument();
        expect(screen.getByText(/product.listingAvailability.available/)).toBeInTheDocument();
    });
});
